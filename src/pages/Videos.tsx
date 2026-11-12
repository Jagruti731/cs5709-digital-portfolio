/**
 * @file Videos page: a player with a playlist of local MP4 files and their poster frames. Content: public/data/videos.json.
 */
import { useRef, useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { Section } from '../components/Section';
import { LoadState } from '../components/LoadState';
import { useContent } from '../hooks/useContent';
import { videoFile } from '../lib/assets';

export default function Videos() {
  const { data: videos, status, error, retry } = useContent('videos');
  const [current, setCurrent] = useState(0);
  const player = useRef<HTMLVideoElement>(null);
  if (!videos) return <LoadState status={status} error={error} retry={retry} />;
  const video = videos[current];
  const choose = (i: number) => {
    setCurrent(i);
    window.setTimeout(() => player.current?.play().catch(() => {}), 0);
  };

  return (
    <>
      <PageHeader title="Video gallery" crumb="Videos" intro="Short films about my work and about software evolution." />
      <Section>
        <div className="video-layout">
          <figure className="player">
            <video key={video.id} ref={player} controls preload="metadata" poster={videoFile(video.id, 'jpg')} playsInline>
              <source src={videoFile(video.id, 'mp4')} type="video/mp4" />
              Your browser cannot play this video. <a href={videoFile(video.id, 'mp4')}>Download it</a>.
            </video>
            <figcaption>
              <span className="kind">
                {current + 1} / {videos.length} · {video.duration}
              </span>
              <h2>{video.title}</h2>
              <p>{video.description}</p>
              <div className="btn-row">
                <button className="btn outline" type="button" onClick={() => choose((current - 1 + videos.length) % videos.length)}>
                  ← Previous
                </button>
                <button className="btn outline" type="button" onClick={() => choose((current + 1) % videos.length)}>
                  Next →
                </button>
              </div>
            </figcaption>
          </figure>
          <ol className="playlist" aria-label="Playlist">
            {videos.map((v, i) => (
              <li key={v.id}>
                <button type="button" aria-current={i === current ? 'true' : undefined} onClick={() => choose(i)}>
                  <img src={videoFile(v.id, 'jpg')} alt="" width={960} height={540} loading="lazy" />
                  <span>
                    <b>{v.title}</b>
                    <small>{v.duration}</small>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </div>
      </Section>
    </>
  );
}
