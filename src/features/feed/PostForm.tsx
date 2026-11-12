/**
 * @file PostForm: the "write a post" form of the community feed (CR-13).
 * It keeps only its own draft state; saving is done by the `onPublish` callback from usePostFeed.
 */
import { useState, type FormEvent } from 'react';
import { LIMITS } from '../../config/site';
import { readImage } from './usePostFeed';

interface PostFormProps {
  /** Show the "Your name" field (guests only). */
  askName: boolean;
  guestName: string;
  onGuestName: (name: string) => void;
  /** Saves the post; resolves to true on success. */
  onPublish: (text: string, image: string | null) => Promise<boolean>;
  status: string;
  onStatus: (message: string) => void;
  savedWhere: string;
}

export function PostForm({ askName, guestName, onGuestName, onPublish, status, onStatus, savedWhere }: PostFormProps) {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (await onPublish(text, image)) {
      setText('');
      setImage(null);
    }
  };

  const pickImage = (file?: File) => {
    if (!file) return setImage(null);
    readImage(file)
      .then(setImage)
      .catch((err: Error) => onStatus(err.message));
  };

  return (
    <form className="post-form" onSubmit={submit}>
      {askName && (
        <div className="field">
          <label htmlFor="pf-name">Your name</label>
          <input
            id="pf-name"
            value={guestName}
            onChange={(e) => onGuestName(e.target.value)}
            maxLength={LIMITS.nameChars}
            placeholder="Guest"
          />
        </div>
      )}
      <div className="field">
        <label htmlFor="pf-text">Write a post</label>
        <textarea id="pf-text" value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={LIMITS.postChars} required />
      </div>
      <div className="post-form-row">
        <label className="file-label">
          Add an image
          <input type="file" accept="image/*" onChange={(e) => pickImage(e.target.files?.[0])} />
        </label>
        {image && <img className="thumb" src={image} alt="Selected" />}
        <button className="btn" type="submit">
          Post
        </button>
      </div>
      <p className="note" role="status">
        {status || savedWhere}
      </p>
    </form>
  );
}
