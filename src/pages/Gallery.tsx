/**
 * @file Gallery page: pictures from talks, work and places (CR-30, CR-47).
 * CR-47: the videos were removed at the owner's request; the old /videos address opens the gallery.
 */
import { PageHeader } from '../components/PageHeader';
import { PictureGallery } from '../features/media/PictureGallery';

export default function Gallery() {
  return (
    <>
      <PageHeader title="Gallery" crumb="Gallery" intro="Talks, work and places, in pictures." />
      <PictureGallery />
    </>
  );
}
