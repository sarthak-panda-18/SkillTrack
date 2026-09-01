import { env } from '../config/env';
import { ILearningResource } from '../models/learningRoadmap.model';

export class YoutubeResourceService {
  private apiKey: string;

  constructor() {
    this.apiKey = env.YOUTUBE_API_KEY || process.env.YOUTUBE_API_KEY || '';
  }

  // Parses ISO 8601 duration string (e.g., PT15M33S -> 933 seconds)
  private parseIsoDuration(duration: string): number {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || '0', 10);
    const minutes = parseInt(match[2] || '0', 10);
    const seconds = parseInt(match[3] || '0', 10);
    return hours * 3600 + minutes * 60 + seconds;
  }

  // Formats seconds into MM:SS or HH:MM:SS
  private formatDuration(seconds: number): string {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  // Educational Ranking Engine
  private calculateVideoScore(
    video: any,
    topicTitle: string,
    skillName: string
  ): number {
    let score = 0;
    const title = (video.snippet?.title || '').toLowerCase();
    const description = (video.snippet?.description || '').toLowerCase();
    const targetTopic = topicTitle.toLowerCase();
    const targetSkill = skillName.toLowerCase();

    // 1. Relevance Score (Max 40 points)
    if (title.includes(targetTopic)) score += 30;
    else {
      const words = targetTopic.split(' ').filter((w) => w.length > 2);
      const matchCount = words.filter((w) => title.includes(w)).length;
      score += Math.min(25, (matchCount / (words.length || 1)) * 25);
    }
    if (title.includes(targetSkill) || description.includes(targetSkill)) score += 10;

    // 2. View Count Score (Max 15 points)
    const viewCount = parseInt(video.statistics?.viewCount || '0', 10);
    if (viewCount > 100000) score += 15;
    else if (viewCount > 10000) score += 10;
    else if (viewCount > 1000) score += 5;

    // 3. Engagement Score (Max 15 points)
    const likeCount = parseInt(video.statistics?.likeCount || '0', 10);
    if (viewCount > 0 && likeCount > 0) {
      const ratio = likeCount / viewCount;
      if (ratio > 0.03) score += 15;
      else if (ratio > 0.01) score += 10;
      else score += 5;
    }

    // 4. Duration Suitability (Max 10 points) - Prefer 8 to 90 mins (480s to 5400s)
    const durationSec = this.parseIsoDuration(video.contentDetails?.duration || '');
    if (durationSec >= 480 && durationSec <= 5400) score += 10;
    else if (durationSec >= 300 && durationSec <= 7200) score += 7;
    else if (durationSec > 0 && durationSec < 300) score += 3; // Short clip fallback

    // 5. Channel Quality & Title Keywords (Max 15 points)
    if (
      title.includes('tutorial') ||
      title.includes('course') ||
      title.includes('explained') ||
      title.includes('guide') ||
      title.includes('full course')
    ) {
      score += 15;
    }

    // 6. Freshness (Max 5 points)
    const publishedAt = new Date(video.snippet?.publishedAt || 0).getTime();
    const threeYearsAgo = Date.now() - 3 * 365 * 24 * 3600 * 1000;
    if (publishedAt > threeYearsAgo) score += 5;

    return Math.round(score);
  }

  async searchTopicVideo(
    topicTitle: string,
    skillName: string,
    careerRoleName: string,
    excludeVideoIds: string[] = []
  ): Promise<ILearningResource> {
    const encodedTopic = encodeURIComponent(`${topicTitle} ${skillName} tutorial`);
    const fallbackSearchUrl = `https://www.youtube.com/results?search_query=${encodedTopic}`;

    if (!this.apiKey) {
      console.warn('[YoutubeResourceService] YOUTUBE_API_KEY missing. Returning fallback search URL.');
      return {
        provider: 'YOUTUBE',
        videoId: '',
        url: fallbackSearchUrl,
        title: `${topicTitle} (${skillName} Tutorial)`,
        channelName: 'YouTube Educational Search',
        thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=60',
        duration: 'Tutorial Search',
        viewCount: 0,
        score: 0,
        fetchedAt: new Date(),
        fallbackSearchUrl,
      };
    }

    try {
      // Step 1: Query YouTube Search API v3 for top candidate video IDs
      const searchQuery = encodeURIComponent(`${topicTitle} ${skillName} tutorial`);
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&maxResults=15&key=${this.apiKey}`;
      const searchRes = await fetch(searchUrl);
      if (!searchRes.ok) {
        throw new Error(`YouTube Search API returned status ${searchRes.status}`);
      }
      const searchData: any = await searchRes.json();
      const items = searchData?.items || [];
      const videoIds = items
        .map((item: any) => item.id?.videoId)
        .filter((id: string) => id && !excludeVideoIds.includes(id));

      if (videoIds.length === 0) {
        throw new Error('No new candidate videos found.');
      }

      // Step 2: Query YouTube Videos API v3 for details (contentDetails, statistics)
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoIds.join(',')}&key=${this.apiKey}`;
      const detailsRes = await fetch(detailsUrl);
      if (!detailsRes.ok) {
        throw new Error(`YouTube Videos API returned status ${detailsRes.status}`);
      }
      const detailsData: any = await detailsRes.json();
      const videoDetails = detailsData?.items || [];

      // Filter out YouTube Shorts (< 120s or #shorts in title)
      const validCandidates = videoDetails.filter((v: any) => {
        const title = (v.snippet?.title || '').toLowerCase();
        const durationSec = this.parseIsoDuration(v.contentDetails?.duration || '');
        if (title.includes('#shorts') || durationSec < 120) return false;
        return true;
      });

      const candidatesToRank = validCandidates.length > 0 ? validCandidates : videoDetails;

      // Rank candidate videos
      const ranked = candidatesToRank.map((v: any) => ({
        video: v,
        score: this.calculateVideoScore(v, topicTitle, skillName),
      }));

      ranked.sort((a: any, b: any) => b.score - a.score);

      const topMatch = ranked[0]?.video;
      if (!topMatch) {
        throw new Error('Could not rank candidate videos.');
      }

      const videoId = topMatch.id;
      const durationSec = this.parseIsoDuration(topMatch.contentDetails?.duration || '');

      return {
        provider: 'YOUTUBE',
        videoId,
        url: `https://www.youtube.com/watch?v=${videoId}`,
        title: topMatch.snippet?.title || topicTitle,
        channelName: topMatch.snippet?.channelTitle || 'YouTube Educator',
        thumbnail:
          topMatch.snippet?.thumbnails?.high?.url ||
          topMatch.snippet?.thumbnails?.medium?.url ||
          `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        duration: this.formatDuration(durationSec),
        viewCount: parseInt(topMatch.statistics?.viewCount || '0', 10),
        score: ranked[0].score,
        fetchedAt: new Date(),
        fallbackSearchUrl,
      };
    } catch (error: any) {
      console.warn('[YoutubeResourceService] Failed to fetch direct video via YouTube API:', error?.message || error);
      return {
        provider: 'YOUTUBE',
        videoId: '',
        url: fallbackSearchUrl,
        title: `${topicTitle} (${skillName} Tutorial)`,
        channelName: 'YouTube Search Recommendation',
        thumbnail: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=500&auto=format&fit=crop&q=60',
        duration: 'Search Tutorial',
        viewCount: 0,
        score: 0,
        fetchedAt: new Date(),
        fallbackSearchUrl,
      };
    }
  }
}

export const youtubeResourceService = new YoutubeResourceService();
