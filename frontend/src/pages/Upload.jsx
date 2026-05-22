import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import CircleViewer from '../components/CircleViewer';
import CircleEmptyState from '../components/CircleEmptyState';
import GlowButton from '../components/GlowButton';
import ResultCard from '../components/ResultCard';
import PageShell from '../components/PageShell';
import MainGrid from '../components/MainGrid';
import { detectMudra, parseApiResponse } from '../utils/api';

export default function Upload() {
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const onChoose = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setResult(null);
    setError(null);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };

  const onDetect = async () => {
    if (!file) {
      setError('Choose an image first');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const { ok, status, data } = await detectMudra(file);
      if (!ok) {
        setError(status === 503 ? 'Service unavailable' : `Request failed (${status})`);
        return;
      }
      const { mudra, confidence } = parseApiResponse(data);
      if (!mudra) {
        setError('No hand detected in image');
        return;
      }
      setResult({
        mudra,
        confidence: `${(confidence * 100).toFixed(2)}%`,
      });
    } catch {
      setError('Network error — is the API running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell className="flex min-h-screen flex-col">
      <Header showBack backTo="/" />

      <div className="flex flex-1 flex-col justify-center pb-16 pt-8 sm:pt-12">
      <MainGrid
        left={
          <>
            <CircleViewer badge={preview ? 'Image Uploaded' : null}>
              {preview ? (
                <img
                  src={preview}
                  alt="Uploaded mudra"
                  className="h-full w-full object-cover"
                />
              ) : (
                <CircleEmptyState label="Choose an image" />
              )}
            </CircleViewer>

            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onChoose}
            />

            <div className="mt-8 flex w-full max-w-md flex-wrap items-center justify-center gap-3">
              <GlowButton variant="outline" onClick={() => inputRef.current?.click()}>
                Choose Image
              </GlowButton>
              <GlowButton variant="gold" disabled={!file || loading} onClick={onDetect}>
                {loading ? 'Detecting…' : 'Detect Mudra'}
              </GlowButton>
              <GlowButton variant="ghost" onClick={() => navigate('/')}>
                Home
              </GlowButton>
            </div>

            {error && (
              <p className="mt-4 text-center text-sm text-red-400" role="alert">
                {error}
              </p>
            )}
          </>
        }
        right={
          loading ? (
            <ResultCard loading />
          ) : (
            <ResultCard
              mudra={result?.mudra}
              confidence={result?.confidence}
              placeholder="Upload a hand mudra image and tap Detect Mudra. Your result will appear here."
            />
          )
        }
      />
      </div>
    </PageShell>
  );
}
