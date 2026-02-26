import notLikeUsCover from '../../assets/not-like-us-cover.png';
import notLikeUsAudio from '../../assets/not-like-us.mp3';

export interface Track {
  title: string;
  artist: string;
  cover: string;
  url: string;
}

export const TRACKS: Track[] = [
  {
    title: "Not Like Us",
    artist: "Kendrick Lamar",
    cover: notLikeUsCover,
    url: notLikeUsAudio,
  },
];
