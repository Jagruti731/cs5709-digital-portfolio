/**
 * @file Gallery page: pictures and videos on one page, in two tabs (CR-30).
 *
 * Phase 1 had separate Pictures and Videos pages. They are merged to keep the
 * menu short; both galleries the brief asks for are still here. The tab is in
 * the URL (/gallery?tab=videos), and the old /videos address redirects to it.
 */
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { PictureGallery } from '../features/media/PictureGallery';
import { VideoGallery } from '../features/media/VideoGallery';

type Tab = 'pictures' | 'videos';

export default function Gallery() {
  const [params, setParams] = useSearchParams();
  const tab: Tab = params.get('tab') === 'videos' ? 'videos' : 'pictures';
  return (
    <>
      <PageHeader title="Gallery" crumb="Gallery" intro="Pictures and short videos about my work and life." />
      <div className="container">
        <div className="tabs gallery-tabs" role="tablist" aria-label="Gallery">
          <button role="tab" type="button" aria-selected={tab === 'pictures'} onClick={() => setParams({}, { replace: true })}>
            Pictures
          </button>
          <button role="tab" type="button" aria-selected={tab === 'videos'} onClick={() => setParams({ tab: 'videos' }, { replace: true })}>
            Videos
          </button>
        </div>
      </div>
      {tab === 'pictures' ? <PictureGallery /> : <VideoGallery />}
    </>
  );
}
