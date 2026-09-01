import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';
import { z } from 'zod';
import { env } from '../config/env';
import { Assessment } from '../models/assessment.model';
import { AssessmentQuestion } from '../models/assessmentQuestion.model';
import { Skill } from '../models/skill.model';

const aiQuestionSchema = z.object({
  question: z.string().min(5),
  options: z.array(z.string().min(1)).length(4),
  correctAnswer: z.number().int().min(0).max(3),
  explanation: z.string().min(5),
  topic: z.string().min(2),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
});

const aiResponseSchema = z.object({
  questions: z.array(aiQuestionSchema),
});

export interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
}

export function computeQuestionHash(questionText: string): string {
  const normalized = questionText.toLowerCase().replace(/[^a-z0-9]/g, '');
  return crypto.createHash('sha256').update(normalized).digest('hex');
}

export class AiQuestionService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async generateQuestions(
    skillName: string,
    topic: string = 'General Concepts',
    difficulty: 'EASY' | 'MEDIUM' | 'HARD' = 'MEDIUM',
    count: number = 20
  ): Promise<GeneratedQuestion[]> {
    if (!this.genAI) {
      console.warn('[AI Question Service] Gemini API key not configured. Using fallback bank.');
      return this.getFallbackQuestions(skillName, topic, difficulty, count);
    }

    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a senior technical interviewer creating multiple choice assessment questions for engineering students.
Generate ${count} high-quality, conceptual, non-duplicate multiple choice questions for:
- Technical Skill: ${skillName}
- Topic: ${topic}
- Target Difficulty: ${difficulty}

CRITICAL RULES:
1. Return ONLY raw JSON without markdown formatting or backticks.
2. Each question MUST have exactly 4 distinct, unambiguous options.
3. 'correctAnswer' MUST be an integer index (0, 1, 2, or 3) pointing to the correct option.
4. Provide a clear, educational explanation for why that option is correct.
5. JSON Format required:
{
  "questions": [
    {
      "question": "Clear question text?",
      "options": ["Option 0", "Option 1", "Option 2", "Option 3"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation...",
      "topic": "${topic}",
      "difficulty": "${difficulty}"
    }
  ]
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      const validated = aiResponseSchema.parse(parsed);
      return validated.questions as GeneratedQuestion[];
    } catch (error) {
      console.error('[AI Question Generation Error]', error);
      console.warn('[AI Question Service] Falling back to pre-seeded question bank.');
      return this.getFallbackQuestions(skillName, topic, difficulty, count);
    }
  }

  async replenishQuestionPool(skillId: string, targetPoolSize: number = 100): Promise<number> {
    const assessment = await Assessment.findOne({ skillId });
    if (!assessment) return 0;

    const currentCount = await AssessmentQuestion.countDocuments({ assessmentId: assessment._id, isActive: true });
    if (currentCount >= targetPoolSize) return currentCount;

    const skill = await Skill.findById(skillId);
    if (!skill) return currentCount;

    const needed = targetPoolSize - currentCount;
    const batchSize = 20;
    const batches = Math.ceil(needed / batchSize);

    console.log(`[Question Pool Replenishing] Current: ${currentCount}/${targetPoolSize}. Generating ${needed} questions in ${batches} batch(es)...`);

    let addedCount = 0;
    const topics = ['Core Concepts', 'Syntax & Architecture', 'Data Structures & OOP', 'Performance & Best Practices', 'Debugging & Edge Cases'];
    const difficulties: Array<'EASY' | 'MEDIUM' | 'HARD'> = ['EASY', 'MEDIUM', 'HARD'];

    for (let b = 0; b < batches; b++) {
      const currentTopic = topics[b % topics.length];
      const currentDiff = difficulties[b % difficulties.length];

      const generated = await this.generateQuestions(skill.name, currentTopic, currentDiff, batchSize);

      for (let i = 0; i < generated.length; i++) {
        const q = generated[i];
        const hash = computeQuestionHash(q.question);

        // Check if question hash already exists in DB
        const existing = await AssessmentQuestion.findOne({ assessmentId: assessment._id, questionHash: hash });
        if (existing) continue;

        await AssessmentQuestion.create({
          assessmentId: assessment._id,
          skillId: skill._id,
          topic: q.topic || currentTopic,
          question: q.question,
          questionHash: hash,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty || currentDiff,
          points: 1,
          order: currentCount + addedCount + 1,
          isActive: true,
        });

        addedCount++;
      }
    }

    const finalCount = await AssessmentQuestion.countDocuments({ assessmentId: assessment._id, isActive: true });
    console.log(`[Question Pool Replenished] Added ${addedCount} unique questions. New pool total: ${finalCount}`);
    return finalCount;
  }

  getFallbackQuestions(
    skillName: string,
    topic: string,
    difficulty: 'EASY' | 'MEDIUM' | 'HARD',
    count: number = 20
  ): GeneratedQuestion[] {
    const key = skillName.toLowerCase();
    const bank = fallbackBank[key] || fallbackBank['default'];
    const result: GeneratedQuestion[] = [];
    
    // Fill result up to required count (20)
    for (let i = 0; i < count; i++) {
      const q = bank[i % bank.length];
      result.push({
        ...q,
        difficulty: difficulty || q.difficulty,
        question: i >= bank.length ? `${q.question} (Variation ${Math.floor(i / bank.length) + 1})` : q.question,
      });
    }

    return result;
  }
}

export const aiQuestionService = new AiQuestionService();

// Pre-seeded rich fallback question bank with 20+ conceptual MCQs per core skill
export const fallbackBank: { [skill: string]: GeneratedQuestion[] } = {
  java: [
    {
      question: 'Which component of Java converts bytecode into machine-executable instructions at runtime?',
      options: ['JDK', 'JRE', 'JVM', 'JIT Compiler'],
      correctAnswer: 2,
      explanation: 'The JVM (Java Virtual Machine) executes Java bytecode by converting it into machine code.',
      topic: 'Syntax & Architecture',
      difficulty: 'EASY',
    },
    {
      question: 'What is the default value of a boolean variable declared as a class field in Java?',
      options: ['true', 'false', 'null', '0'],
      correctAnswer: 1,
      explanation: 'Class instance variables of primitive boolean type default to false in Java.',
      topic: 'Syntax & Architecture',
      difficulty: 'EASY',
    },
    {
      question: 'Which of the following OOP principles allows a subclass to provide a specific implementation of a method defined in its superclass?',
      options: ['Encapsulation', 'Abstraction', 'Method Overriding', 'Method Overloading'],
      correctAnswer: 2,
      explanation: 'Method overriding permits a subclass to redefine a method inherited from a superclass with runtime polymorphism.',
      topic: 'OOP',
      difficulty: 'MEDIUM',
    },
    {
      question: 'What happens when a code block inside a try block throws an unhandled exception?',
      options: ['Control passes to the finally block if present, then thread terminates', 'Execution resumes at next line', 'Program restarts', 'JVM crashes immediately'],
      correctAnswer: 0,
      explanation: 'If an exception is unhandled by catch, finally still executes before unwinding the stack and terminating the thread.',
      topic: 'Exception Handling',
      difficulty: 'MEDIUM',
    },
    {
      question: 'Which Collection interface implementation guarantees unique elements and maintains insertion order in Java?',
      options: ['HashSet', 'TreeSet', 'LinkedHashSet', 'ArrayList'],
      correctAnswer: 2,
      explanation: 'LinkedHashSet maintains a doubly-linked list across its elements, preserving insertion order while enforcing uniqueness.',
      topic: 'Collections',
      difficulty: 'HARD',
    },
    {
      question: 'What is the time complexity of searching an element in a HashMap with a good hash function?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
      correctAnswer: 0,
      explanation: 'A well-distributed hash function provides average constant O(1) time complexity for lookup.',
      topic: 'Collections',
      difficulty: 'MEDIUM',
    },
    {
      question: 'Which keyword in Java prevents a class from being subclassed or a method from being overridden?',
      options: ['static', 'final', 'abstract', 'volatile'],
      correctAnswer: 1,
      explanation: 'The final keyword prevents inheritance when applied to classes and overriding when applied to methods.',
      topic: 'Syntax & Architecture',
      difficulty: 'EASY',
    },
    {
      question: 'Which interface must a class implement to allow its instances to be sorted using Collections.sort() naturally?',
      options: ['Comparator', 'Comparable', 'Cloneable', 'Serializable'],
      correctAnswer: 1,
      explanation: 'Comparable interface defines compareTo(T o) for natural sorting order.',
      topic: 'Collections',
      difficulty: 'MEDIUM',
    },
    {
      question: 'What is the purpose of the transient keyword in Java?',
      options: ['Prevents a field from being serialized', 'Makes a field thread-safe', 'Allocates variable in cache', 'Prevents garbage collection'],
      correctAnswer: 0,
      explanation: 'Transient variables are ignored during JVM object serialization.',
      topic: 'Syntax & Architecture',
      difficulty: 'HARD',
    },
    {
      question: 'How does garbage collection manage memory in Java?',
      options: ['Manually via free()', 'Deallocates unreferenced heap objects automatically', 'Deletes stack variables', 'Clears disk swap'],
      correctAnswer: 1,
      explanation: 'Java GC automatically reclaims heap memory occupied by unreachable objects.',
      topic: 'JVM Internals',
      difficulty: 'MEDIUM',
    },
    {
      question: 'What is the difference between String, StringBuilder, and StringBuffer in Java?',
      options: ['String is immutable; StringBuilder is mutable non-thread-safe; StringBuffer is mutable thread-safe', 'All three are identical', 'StringBuffer is immutable', 'StringBuilder is thread-safe'],
      correctAnswer: 0,
      explanation: 'String is immutable. StringBuilder offers synchronized-free fast string mutation. StringBuffer is synchronized for multi-threading.',
      topic: 'Syntax & Architecture',
      difficulty: 'MEDIUM',
    },
    {
      question: 'What is a functional interface in Java 8+?',
      options: ['An interface with exactly one abstract method', 'An interface with no methods', 'An interface with static fields only', 'A marker interface'],
      correctAnswer: 0,
      explanation: 'Functional interfaces contain exactly one abstract method and can be implemented via Lambda expressions.',
      topic: 'Java 8+ Features',
      difficulty: 'EASY',
    },
    {
      question: 'Which method of Thread class pauses execution without releasing locks?',
      options: ['wait()', 'sleep()', 'yield()', 'join()'],
      correctAnswer: 1,
      explanation: 'Thread.sleep() pauses current thread for specified duration without releasing object monitor locks.',
      topic: 'Multithreading',
      difficulty: 'HARD',
    },
    {
      question: 'What is the result of 5 + 2 + "3" in Java?',
      options: ['"523"', '"73"', '10', 'Compilation Error'],
      correctAnswer: 1,
      explanation: 'Left-to-right evaluation performs 5 + 2 = 7, then concatenates with string "3" resulting in "73".',
      topic: 'Syntax & Architecture',
      difficulty: 'EASY',
    },
    {
      question: 'Which garbage collection algorithm uses Young, Old, and Permanent/Metaspace generations?',
      options: ['Mark-and-Sweep', 'Generational Garbage Collection', 'Reference Counting', 'Stop-the-World Manual'],
      correctAnswer: 1,
      explanation: 'HotSpot JVM employs Generational GC optimizing short-lived young objects vs long-lived old objects.',
      topic: 'JVM Internals',
      difficulty: 'HARD',
    },
    {
      question: 'What does the volatile keyword guarantee for a shared variable across threads?',
      options: ['Atomicity', 'Visibility of writes across threads', 'Reentrant locking', 'Automatic serialization'],
      correctAnswer: 1,
      explanation: 'Volatile forces reads/writes directly to main memory, ensuring updates are immediately visible to all threads.',
      topic: 'Multithreading',
      difficulty: 'HARD',
    },
    {
      question: 'What is the superclass of all classes in Java?',
      options: ['java.lang.Object', 'java.lang.Class', 'java.lang.System', 'java.lang.Base'],
      correctAnswer: 0,
      explanation: 'java.lang.Object is the root of the class hierarchy in Java.',
      topic: 'OOP',
      difficulty: 'EASY',
    },
    {
      question: 'Which stream terminal operation returns an Optional containing any element of the stream?',
      options: ['findAny()', 'collect()', 'map()', 'filter()'],
      correctAnswer: 0,
      explanation: 'findAny() is a terminal operation returning an Optional describing some element of the stream.',
      topic: 'Java 8+ Features',
      difficulty: 'MEDIUM',
    },
    {
      question: 'What happens if a static method is declared with the same signature in a subclass in Java?',
      options: ['Method overriding occurs', 'Method hiding occurs', 'Compilation Error', 'Runtime Exception'],
      correctAnswer: 1,
      explanation: 'Static methods cannot be overridden dynamically; subclass static methods hide superclass static methods.',
      topic: 'OOP',
      difficulty: 'MEDIUM',
    },
    {
      question: 'What is the purpose of Optional in Java 8?',
      options: ['To provide a type-level solution for representing optional values and preventing NullPointerExceptions', 'To speed up collection queries', 'To handle async tasks', 'To create optional parameters'],
      correctAnswer: 0,
      explanation: 'Optional<T> is a container object used to explicitly model absent values and avoid null pointer errors.',
      topic: 'Java 8+ Features',
      difficulty: 'MEDIUM',
    },
  ],

  javascript: [
    {
      question: 'Which keyword in JavaScript creates a block-scoped variable that cannot be reassigned?',
      options: ['var', 'let', 'const', 'static'],
      correctAnswer: 2,
      explanation: 'const creates a read-only reference to a value scoped within its enclosing block.',
      topic: 'ES6+ Syntax',
      difficulty: 'EASY',
    },
    {
      question: 'What is the result of typeof NaN in JavaScript?',
      options: ['"number"', '"nan"', '"undefined"', '"object"'],
      correctAnswer: 0,
      explanation: 'In JavaScript specification, NaN (Not-a-Number) is a special numeric value, so typeof NaN evaluates to "number".',
      topic: 'Variables & Types',
      difficulty: 'EASY',
    },
    {
      question: 'Which method returns a new array with elements that pass a provided test function?',
      options: ['Array.map()', 'Array.filter()', 'Array.reduce()', 'Array.forEach()'],
      correctAnswer: 1,
      explanation: 'Array.filter() creates a shallow copy of a portion of a given array filtered down to elements that return true for the callback.',
      topic: 'Arrays & Functional',
      difficulty: 'MEDIUM',
    },
    {
      question: 'What does the Event Loop do in JavaScript execution runtime?',
      options: ['Compiles JavaScript to assembly', 'Monitors Call Stack and Task Queue to execute asynchronous callbacks', 'Manages memory garbage collection', 'Multi-threads CPU operations'],
      correctAnswer: 1,
      explanation: 'The Event Loop checks if the Call Stack is empty and moves callbacks from the Microtask/Macrotask queue into the Call Stack for execution.',
      topic: 'Async & Runtime',
      difficulty: 'HARD',
    },
    {
      question: 'How does a Promise state transition in JavaScript?',
      options: ['Pending -> Fulfilled or Rejected (settled once)', 'Fulfilled -> Pending', 'Rejected -> Fulfilled', 'Pending -> Pending'],
      correctAnswer: 0,
      explanation: 'A Promise starts in Pending status and can settle permanently into either Fulfilled or Rejected state.',
      topic: 'Async & Promises',
      difficulty: 'MEDIUM',
    },
    {
      question: 'What is Closure in JavaScript?',
      options: ['A function bundled together with references to its surrounding lexical environment', 'A method to close browser windows', 'A private class syntax', 'A DOM termination hook'],
      correctAnswer: 0,
      explanation: 'A closure gives an inner function access to an outer function\'s scope even after outer function returns.',
      topic: 'Functions & Scope',
      difficulty: 'MEDIUM',
    },
    {
      question: 'What is the result of 0.1 + 0.2 === 0.3 in JavaScript?',
      options: ['false', 'true', 'TypeError', 'SyntaxError'],
      correctAnswer: 0,
      explanation: 'Binary floating-point arithmetic (IEEE 754) causes 0.1 + 0.2 to evaluate to 0.30000000000000004.',
      topic: 'Variables & Types',
      difficulty: 'MEDIUM',
    },
    {
      question: 'What is Hoisting in JavaScript?',
      options: ['Declarations of variables and functions are moved to top of scope during compilation', 'Lifting DOM elements dynamically', 'Optimizing loop execution', 'Garbage collection pass'],
      correctAnswer: 0,
      explanation: 'Hoisting allows function declarations and var variables to be referenced before line of declaration.',
      topic: 'Functions & Scope',
      difficulty: 'EASY',
    },
    {
      question: 'Which method stops event propagation up the DOM tree?',
      options: ['event.stopPropagation()', 'event.preventDefault()', 'event.stop()', 'event.cancelBubble()'],
      correctAnswer: 0,
      explanation: 'stopPropagation() prevents further bubbling or capturing phase traversal of the current event.',
      topic: 'DOM & Events',
      difficulty: 'EASY',
    },
    {
      question: 'What is the difference between == and === operators in JavaScript?',
      options: ['== performs type coercion before comparison; === checks strict value and type without coercion', 'They are identical', '=== performs type coercion', '== compares memory addresses'],
      correctAnswer: 0,
      explanation: 'Loose equality (==) coerces operands to matching types; strict equality (===) requires identical types.',
      topic: 'Variables & Types',
      difficulty: 'EASY',
    },
    {
      question: 'Which array method executes a reducer function on each element resulting in a single output value?',
      options: ['reduce()', 'map()', 'some()', 'every()'],
      correctAnswer: 0,
      explanation: 'Array.prototype.reduce() accumulates array elements into a single value.',
      topic: 'Arrays & Functional',
      difficulty: 'MEDIUM',
    },
    {
      question: 'What is the purpose of Symbol primitive type introduced in ES6?',
      options: ['Create unique and immutable identifiers for object properties', 'Create mathematical symbols', 'Handle async operations', 'Format international currency'],
      correctAnswer: 0,
      explanation: 'Symbols generate guaranteed unique property keys preventing property name collisions.',
      topic: 'ES6+ Syntax',
      difficulty: 'HARD',
    },
    {
      question: 'What is the behavior of arrow functions regarding the `this` keyword?',
      options: ['They inherit `this` lexically from the enclosing scope', 'They create their own dynamic `this`', '`this` is always undefined', '`this` binds to DOM window'],
      correctAnswer: 0,
      explanation: 'Arrow functions do not bind their own `this`; they retain `this` value of enclosing lexical context.',
      topic: 'Functions & Scope',
      difficulty: 'MEDIUM',
    },
    {
      question: 'Which microtask queue has higher execution priority than setTimeout callbacks?',
      options: ['Promise.then / process.nextTick', 'DOM Event queue', 'requestAnimationFrame', 'setInterval'],
      correctAnswer: 0,
      explanation: 'Microtasks (Promises) execute immediately after current script completes before Macrotasks (setTimeout).',
      topic: 'Async & Runtime',
      difficulty: 'HARD',
    },
    {
      question: 'What is the result of Array.from("JS")?',
      options: ['["J", "S"]', '["JS"]', 'TypeError', 'undefined'],
      correctAnswer: 0,
      explanation: 'Array.from() creates a new array instance from an iterable string "JS" -> ["J", "S"].',
      topic: 'Arrays & Functional',
      difficulty: 'EASY',
    },
    {
      question: 'What does Object.freeze() do to a JavaScript object?',
      options: ['Prevents adding, deleting, or modifying existing properties', 'Deletes all properties', 'Converts object to string', 'Makes object async'],
      correctAnswer: 0,
      explanation: 'Object.freeze() renders an object completely immutable (shallow freeze).',
      topic: 'Objects & Prototypes',
      difficulty: 'MEDIUM',
    },
    {
      question: 'What is the Prototype chain in JavaScript?',
      options: ['Mechanism by which objects inherit features and properties from one another', 'A DOM tree hierarchy', 'A list of active promises', 'A call stack frame'],
      correctAnswer: 0,
      explanation: 'Every object has a prototype link (__proto__); property lookups traverse this chain until Object.prototype.',
      topic: 'Objects & Prototypes',
      difficulty: 'HARD',
    },
    {
      question: 'What is the default return value of a JavaScript function that does not contain an explicit return statement?',
      options: ['undefined', 'null', '0', 'false'],
      correctAnswer: 0,
      explanation: 'Functions without explicit return evaluation implicitly return undefined.',
      topic: 'Functions & Scope',
      difficulty: 'EASY',
    },
    {
      question: 'What does async / await syntax do under the hood?',
      options: ['Syntactic sugar over Promises and Generators', 'Multi-threads JavaScript code on C++ background threads', 'Blocks CPU execution', 'Compiles code to WebAssembly'],
      correctAnswer: 0,
      explanation: 'async/await simplifies writing asynchronous Promise-based code using generator-like resumption.',
      topic: 'Async & Promises',
      difficulty: 'MEDIUM',
    },
    {
      question: 'Which method converts a JavaScript object or value to a JSON formatted string?',
      options: ['JSON.stringify()', 'JSON.parse()', 'Object.toString()', 'String.toJSON()'],
      correctAnswer: 0,
      explanation: 'JSON.stringify() serializes a JavaScript value or object into a JSON string.',
      topic: 'Variables & Types',
      difficulty: 'EASY',
    },
  ],

  python: [
    {
      question: 'Which built-in Python data structure is immutable?',
      options: ['List', 'Dictionary', 'Set', 'Tuple'],
      correctAnswer: 3,
      explanation: 'Tuples are immutable sequence types in Python; their elements cannot be altered after creation.',
      topic: 'Data Types',
      difficulty: 'EASY',
    },
    {
      question: 'What is the output of len(set([1, 2, 2, 3, 3, 3])) in Python?',
      options: ['6', '3', '2', '1'],
      correctAnswer: 1,
      explanation: 'Python sets automatically deduplicate values. {1, 2, 3} has a length of 3.',
      topic: 'Data Types',
      difficulty: 'EASY',
    },
    {
      question: 'What is a decorator in Python?',
      options: ['A function that takes another function as an argument and extends its behavior without modifying it', 'A class attribute modifier', 'A GUI layout wrapper', 'A database ORM plugin'],
      correctAnswer: 0,
      explanation: 'Python decorators wrap functions or methods using @syntax to augment or modify behavior dynamically.',
      topic: 'Advanced Python',
      difficulty: 'MEDIUM',
    },
    {
      question: 'How does List Comprehension evaluate [x*2 for x in range(5) if x % 2 == 0]?',
      options: ['[0, 4, 8]', '[0, 2, 4, 6, 8]', '[2, 6]', '[0, 1, 2, 3, 4]'],
      correctAnswer: 0,
      explanation: 'Even numbers in range(5) are 0, 2, 4. Multiplying each by 2 yields [0, 4, 8].',
      topic: 'Functional Python',
      difficulty: 'MEDIUM',
    },
    {
      question: 'What is the GIL (Global Interpreter Lock) in CPython?',
      options: ['A mutex that prevents multiple native threads from executing Python bytecodes at once', 'A security encryption key', 'A memory allocator', 'A process supervisor'],
      correctAnswer: 0,
      explanation: 'GIL is a synchronization lock used by CPython to ensure only one thread executes Python bytecode at a time, impacting CPU-bound multi-threading.',
      topic: 'Architecture & Concurrency',
      difficulty: 'HARD',
    },
    {
      question: 'What keyword is used to define a generator function in Python?',
      options: ['yield', 'return', 'emit', 'generate'],
      correctAnswer: 0,
      explanation: 'Using yield inside a function transforms it into a generator function returning an iterator.',
      topic: 'Advanced Python',
      difficulty: 'MEDIUM',
    },
    {
      question: 'What is the difference between `is` and `==` in Python?',
      options: ['`is` checks identity (memory location); `==` checks value equality', 'They are identical', '`==` checks identity', '`is` compares strings only'],
      correctAnswer: 0,
      explanation: '`is` evaluates if two variables point to exact same object in memory (`id(a) == id(b)`).',
      topic: 'Data Types',
      difficulty: 'EASY',
    },
    {
      question: 'What is *args and **kwargs in Python function parameters?',
      options: ['*args passes non-keyword variable arguments as a tuple; **kwargs passes keyword arguments as a dict', 'Both pass lists', 'Both pass dictionaries', '*args is mandatory'],
      correctAnswer: 0,
      explanation: '*args gathers positional arguments into a tuple; **kwargs gathers keyword arguments into a dictionary.',
      topic: 'Functions & Scope',
      difficulty: 'EASY',
    },
    {
      question: 'What is the time complexity of dictionary lookup by key in Python on average?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n^2)'],
      correctAnswer: 0,
      explanation: 'Python dicts are hash tables providing average O(1) key lookup complexity.',
      topic: 'Data Types',
      difficulty: 'EASY',
    },
    {
      question: 'Which dunder method handles object string representation for end-user readability?',
      options: ['__str__', '__repr__', '__init__', '__call__'],
      correctAnswer: 0,
      explanation: '__str__ returns human-readable string representation of an object invoked by print() and str().',
      topic: 'OOP in Python',
      difficulty: 'MEDIUM',
    },
    {
      question: 'What is a Context Manager in Python commonly used with?',
      options: ['`with` statement to manage resources like files and network sockets', '`for` loop', '`try-except`', '`lambda`'],
      correctAnswer: 0,
      explanation: 'Context managers implement __enter__ and __exit__ for clean resource allocation/deallocation.',
      topic: 'Advanced Python',
      difficulty: 'MEDIUM',
    },
    {
      question: 'What does the `pass` statement do in Python?',
      options: ['Acts as a null placeholder statement where syntax requires code', 'Passes execution to next function', 'Exits current loop', 'Skips exception'],
      correctAnswer: 0,
      explanation: '`pass` is a no-operation statement used when code structure requires a block.',
      topic: 'Data Types',
      difficulty: 'EASY',
    },
    {
      question: 'How are arguments passed in Python (Pass-by-value or Pass-by-reference)?',
      options: ['Pass-by-object-reference (assignment of object references)', 'Pass-by-value strictly', 'Pass-by-reference strictly', 'Pass-by-name'],
      correctAnswer: 0,
      explanation: 'Python passes object references. Mutable objects can be modified inside functions; immutable objects cannot.',
      topic: 'Functions & Scope',
      difficulty: 'HARD',
    },
    {
      question: 'What does `__slots__` do when declared inside a Python class?',
      options: ['Restricts creation of instance attributes to save memory by preventing __dict__ creation', 'Defines database slots', 'Limits class inheritance', 'Enforces type annotations'],
      correctAnswer: 0,
      explanation: '__slots__ allocates fixed space for specified attributes, optimizing memory for large object instances.',
      topic: 'OOP in Python',
      difficulty: 'HARD',
    },
    {
      question: 'What is a Lambda function in Python?',
      options: ['An anonymous inline function defined with lambda keyword', 'A recursive class method', 'A thread worker', 'A package installer'],
      correctAnswer: 0,
      explanation: 'Lambda functions are small single-expression inline functions without formal names.',
      topic: 'Functional Python',
      difficulty: 'EASY',
    },
    {
      question: 'Which module in Python standard library provides deep and shallow copy operations?',
      options: ['copy', 'clone', 'sys', 'os'],
      correctAnswer: 0,
      explanation: 'The `copy` module provides `copy.copy()` for shallow copy and `copy.deepcopy()` for recursive deep copy.',
      topic: 'Advanced Python',
      difficulty: 'MEDIUM',
    },
    {
      question: 'What is the output of `list(range(1, 10, 2))` in Python?',
      options: ['[1, 3, 5, 7, 9]', '[1, 2, 3, 4, 5]', '[2, 4, 6, 8, 10]', '[1, 10]'],
      correctAnswer: 0,
      explanation: 'range(start=1, stop=10, step=2) generates odd numbers 1, 3, 5, 7, 9.',
      topic: 'Data Types',
      difficulty: 'EASY',
    },
    {
      question: 'What is Metaclass in Python?',
      options: ['A class whose instances are classes themselves', 'A superclass of Object', 'A module wrapper', 'A decorator factory'],
      correctAnswer: 0,
      explanation: 'Metaclass defines how classes are constructed (type is the default metaclass of Python classes).',
      topic: 'OOP in Python',
      difficulty: 'HARD',
    },
    {
      question: 'What is the purpose of `virtualenv` or `venv` in Python development?',
      options: ['Isolate project dependencies and Python runtime packages per project', 'Speed up CPU compilation', 'Host web apps', 'Manage git commits'],
      correctAnswer: 0,
      explanation: 'Virtual environments create isolated directory trees containing specific library versions.',
      topic: 'Architecture & Concurrency',
      difficulty: 'EASY',
    },
    {
      question: 'What is the behavior of `sys.setrecursionlimit()` in Python?',
      options: ['Modifies maximum depth of Python interpreter stack', 'Limits array sizes', 'Limits memory usage', 'Restricts loop iterations'],
      correctAnswer: 0,
      explanation: 'setrecursionlimit sets maximum recursion depth of Python call stack (default 1000).',
      topic: 'Advanced Python',
      difficulty: 'HARD',
    },
  ],

  default: [
    {
      question: 'What is the primary objective of automated software testing and assessment?',
      options: ['Verify system requirements, detect bugs early, and ensure code quality', 'Replace software engineers', 'Increase application payload size', 'Slow down production release'],
      correctAnswer: 0,
      explanation: 'Software testing validates functional requirements and identifies regressions early in the lifecycle.',
      topic: 'General Concepts',
      difficulty: 'EASY',
    },
    {
      question: 'What does asymptotic time complexity O(n log n) represent in algorithm analysis?',
      options: ['Linearithmic growth typical of efficient comparison sorts like Merge Sort', 'Constant time lookup', 'Quadratic nested loops', 'Exponential decay'],
      correctAnswer: 0,
      explanation: 'O(n log n) is standard for optimal comparison sorting algorithms like Merge Sort and Quick Sort.',
      topic: 'Algorithm Analysis',
      difficulty: 'MEDIUM',
    },
    {
      question: 'Which HTTP status code indicates a client requested a resource that does not exist on the server?',
      options: ['200 OK', '404 Not Found', '500 Internal Server Error', '403 Forbidden'],
      correctAnswer: 1,
      explanation: '404 Not Found indicates that the server cannot locate the requested endpoint or resource.',
      topic: 'Web Fundamentals',
      difficulty: 'EASY',
    },
    {
      question: 'Why are database indexes used in SQL relational database systems?',
      options: ['To speed up data retrieval operations at the cost of additional write/storage overhead', 'To compress text columns', 'To encrypt sensitive rows', 'To enforce foreign key constraints exclusively'],
      correctAnswer: 0,
      explanation: 'Indexes create B-Tree lookup structures that accelerate SELECT queries while adding write time for INSERT/UPDATE.',
      topic: 'Database Systems',
      difficulty: 'MEDIUM',
    },
    {
      question: 'What is the main advantage of RESTful API architecture?',
      options: ['Stateless client-server communication using standard HTTP methods', 'Requires persistent socket connection', 'Only works with XML', 'No URL routing required'],
      correctAnswer: 0,
      explanation: 'REST uses stateless communication and uniform HTTP interfaces (GET, POST, PUT, DELETE).',
      topic: 'Web Fundamentals',
      difficulty: 'EASY',
    },
    {
      question: 'What is the primary purpose of Continuous Integration (CI)?',
      options: ['Automatically build, test, and validate code changes pushed to a shared repository', 'Deploy code directly to production without testing', 'Store database backups', 'Monitor CPU temperature'],
      correctAnswer: 0,
      explanation: 'CI automates building and testing of code changes to catch defects early.',
      topic: 'DevOps & Tooling',
      difficulty: 'EASY',
    },
    {
      question: 'What is the difference between synchronous and asynchronous execution?',
      options: ['Synchronous blocks execution until task finishes; asynchronous executes without blocking caller thread', 'Synchronous is faster for all tasks', 'Asynchronous runs only in single thread without events', 'They are identical'],
      correctAnswer: 0,
      explanation: 'Asynchronous tasks run non-blockingly, allowing main loop to continue processing concurrent tasks.',
      topic: 'General Concepts',
      difficulty: 'MEDIUM',
    },
    {
      question: 'What does the DRY principle in software engineering stand for?',
      options: ['Don\'t Repeat Yourself', 'Do Run Yearly', 'Data Rendering Yield', 'Digital Repository Yield'],
      correctAnswer: 0,
      explanation: 'DRY emphasizes reducing duplication of software patterns and domain knowledge across modules.',
      topic: 'Software Principles',
      difficulty: 'EASY',
    },
    {
      question: 'Which data structure follows the First-In, First-Out (FIFO) access policy?',
      options: ['Queue', 'Stack', 'Tree', 'Graph'],
      correctAnswer: 0,
      explanation: 'Queues operate on a First-In, First-Out (FIFO) discipline.',
      topic: 'Data Structures',
      difficulty: 'EASY',
    },
    {
      question: 'Which data structure operates on Last-In, First-Out (LIFO) order?',
      options: ['Stack', 'Queue', 'Array', 'LinkedList'],
      correctAnswer: 0,
      explanation: 'Stacks operate on a Last-In, First-Out (LIFO) policy.',
      topic: 'Data Structures',
      difficulty: 'EASY',
    },
    {
      question: 'What is the primary purpose of Environment Variables in software applications?',
      options: ['Configure dynamic secrets, URIs, and settings per deployment environment without hardcoding', 'Store database tables', 'Compile source code', 'Create user accounts'],
      correctAnswer: 0,
      explanation: 'Environment variables inject configuration values dynamically across development, staging, and production environments.',
      topic: 'DevOps & Tooling',
      difficulty: 'EASY',
    },
    {
      question: 'What is a Race Condition in concurrent processing systems?',
      options: ['A defect where program output depends unexpectedly on sequence or timing of uncontrollable concurrent events', 'A high-speed network packet', 'An optimization technique', 'A database index lookup'],
      correctAnswer: 0,
      explanation: 'Race conditions occur when asynchronous threads modify shared state without proper synchronization locks.',
      topic: 'General Concepts',
      difficulty: 'HARD',
    },
    {
      question: 'What does SOLID principles aim to achieve in Object-Oriented Software Design?',
      options: ['Create maintainable, scalable, understandable, and flexible code structures', 'Speed up network requests', 'Reduce CSS file sizes', 'Encrypt user passwords'],
      correctAnswer: 0,
      explanation: 'SOLID principles guide software architecture towards modularity, extensibility, and maintainability.',
      topic: 'Software Principles',
      difficulty: 'MEDIUM',
    },
    {
      question: 'What is the purpose of Git version control branching strategy?',
      options: ['Isolate feature development, hotfixes, and releases without corrupting main codebase', 'Compress repository binaries', 'Host web servers', 'Run unit tests'],
      correctAnswer: 0,
      explanation: 'Git branches allow developers to work independently on separate features before merging.',
      topic: 'DevOps & Tooling',
      difficulty: 'EASY',
    },
    {
      question: 'What is idempotency in API design?',
      options: ['An operation that produces the same system result regardless of how many times it is executed with same input', 'An operation that returns different values each time', 'A non-blocking database query', 'A secret API key format'],
      correctAnswer: 0,
      explanation: 'Idempotent HTTP methods (like GET, PUT, DELETE) yield the same state even when repeated.',
      topic: 'Web Fundamentals',
      difficulty: 'HARD',
    },
    {
      question: 'What is a SQL Injection vulnerability?',
      options: ['Attacker injecting malicious SQL statements into backend database queries through untrusted user input', 'Database connection timeout', 'Overfilling memory buffer', 'Cross-site scripting'],
      correctAnswer: 0,
      explanation: 'SQL Injection occurs when user input is concatenated into SQL queries without parameterization.',
      topic: 'Security',
      difficulty: 'MEDIUM',
    },
    {
      question: 'How do parameterized database queries prevent SQL Injection?',
      options: ['They treat user input as literal values rather than executable SQL code', 'They encrypt all columns', 'They disable SQL SELECT commands', 'They cache queries in Redis'],
      correctAnswer: 0,
      explanation: 'Prepared/parameterized statements separate SQL command logic from user-provided data parameters.',
      topic: 'Security',
      difficulty: 'MEDIUM',
    },
    {
      question: 'What is the function of Domain Name System (DNS)?',
      options: ['Translates human-readable domain names into IP addresses', 'Stores user session cookies', 'Renders HTML pages', 'Encrypts TLS certificates'],
      correctAnswer: 0,
      explanation: 'DNS resolves domain names (e.g. skilltrack.ai) to machine-routable IP addresses.',
      topic: 'Web Fundamentals',
      difficulty: 'EASY',
    },
    {
      question: 'What is the purpose of Cross-Origin Resource Sharing (CORS)?',
      options: ['Browser security mechanism allowing servers to specify who can access assets across different origins', 'A CSS layout grid system', 'A database migration script', 'A CPU caching algorithm'],
      correctAnswer: 0,
      explanation: 'CORS HTTP headers authorize cross-origin HTTP requests made by browser web apps.',
      topic: 'Web Fundamentals',
      difficulty: 'MEDIUM',
    },
    {
      question: 'What is the difference between authentication and authorization?',
      options: ['Authentication verifies WHO you are; authorization verifies WHAT you can access', 'They are identical', 'Authorization verifies identity', 'Authentication grants permissions'],
      correctAnswer: 0,
      explanation: 'Authentication establishes identity (login). Authorization checks access permissions (roles).',
      topic: 'Security',
      difficulty: 'EASY',
    },
  ],
};
