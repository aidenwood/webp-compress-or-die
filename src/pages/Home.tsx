import React, { useState, useCallback, useEffect } from 'react';
import { Upload, Image as ImageIcon, Download, ArrowRight, Trash2, Package } from 'lucide-react';
import JSZip from 'jszip';
import Header from '../components/Header';
import Footer from '../components/Footer';
import AsciiFx from '../components/AsciiFx';

interface ConvertedImage {
  originalName: string;
  webpBlob: Blob;
  originalSize: number;
  convertedSize: number;
}

function Home() {
  const [convertedImages, setConvertedImages] = useState<ConvertedImage[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    localStorage.getItem('theme') as 'light' | 'dark' || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const convertToWebP = useCallback(async (file: File): Promise<ConvertedImage> => {
    const img = document.createElement('img');
    const imageUrl = URL.createObjectURL(file);
    
    return new Promise((resolve) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0);
        
        const attemptConversion = (quality: number) => {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              if(file.size > blob.size){
                resolve({
                  originalName: file.name.replace(/\.[^/.]+$/, ''),
                  webpBlob: blob,
                  originalSize: file.size,
                  convertedSize: blob.size,
                });
              }else{
                attemptConversion(quality - 0.1);
              }
              
            }
            URL.revokeObjectURL(imageUrl);
          },
          'image/webp',
          quality
        )};
        attemptConversion(0.8);
      };
      
      img.src = imageUrl;
    });
  }, []);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    await processFiles(Array.from(files));
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(event.dataTransfer.files);
    await processFiles(files);
  };

  const processFiles = async (files: File[]) => {
    setIsConverting(true);
    const imageFiles = files.filter(file => 
      ['image/webp', 'image/avif', 'image/jpeg', 'image/png', 'image/gif', 'image/tiff', 'image/bmp'].includes(file.type)
    );

    const converted = await Promise.all(imageFiles.map(convertToWebP));
    setConvertedImages(prev => [...prev, ...converted]);
    setIsConverting(false);
  };

  const handleDownload = (image: ConvertedImage) => {
    const url = URL.createObjectURL(image.webpBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${image.originalName}.webp`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = async () => {
    if (convertedImages.length === 0) return;
    
    setIsZipping(true);
    const zip = new JSZip();

    // Add all images to the zip
    convertedImages.forEach((image) => {
      zip.file(`${image.originalName}.webp`, image.webpBlob);
    });

    try {
      // Generate the zip file
      const content = await zip.generateAsync({ type: "blob" });
      
      // Create download link
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tinywebp-converted-images.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error creating zip file:', error);
    } finally {
      setIsZipping(false);
    }
  };

  const handleRemove = (index: number) => {
    setConvertedImages(prev => prev.filter((_, i) => i !== index));
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  const calculateSavings = (original: number, converted: number): string => {
    const savings = ((original - converted) / original * 100).toFixed(1);
    return `${savings}%`;
  };

  const totalSavings = convertedImages.reduce((acc, img) => 
    acc + (img.originalSize - img.convertedSize), 0
  );

  return (
    <div className="app-shell app-home">
      <Header theme={theme} toggleTheme={toggleTheme} />

      <main className="app-main">
        <div className="converter-workspace">
          <div className="converter-workspace-main">
            <section className="home-intro" aria-labelledby="home-title">
              <h1 id="home-title">Tiny WebP Image Compression, Completely Free, Blazing Fast.</h1>
              <p className="home-summary">
                Compress images in your browser, then download WebP files one by one or together.
              </p>
              <div className="privacy-note"><span aria-hidden="true" />Your images are processed locally. No file upload.</div>
            </section>

            <section className={`converter-panel ${isDragging ? 'is-dragging' : ''}`} aria-label="Image converter">
              <div
                className="converter-drop-area"
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
              >
                <a className="support-link" href="https://buymeacoffee.com/iamispra" target="_blank" rel="noreferrer">
                  Support this tool <ArrowRight aria-hidden="true" />
                </a>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/tiff,image/bmp,image/webp,image/avif"
                  multiple
                  onChange={handleFileSelect}
                  className="file-input"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="upload-dropzone">
                  <span className="upload-icon-wrap"><Upload className="upload-icon" aria-hidden="true" /></span>
                  <span className="upload-title">Drop your images here</span>
                  <span className="upload-hint">or click to browse</span>
                  <span className="format-list" aria-label="Supported formats">
                    {['JPG', 'PNG', 'GIF', 'TIFF', 'BMP', 'WEBP', 'AVIF *'].map((format) => (
                      <span className="format-tag" key={format}>{format}</span>
                    ))}
                  </span>
                  <span className="format-note">* AVIF conversion is experimental.</span>
                </label>
              </div>
            </section>

            {isConverting && (
              <div className="conversion-status" role="status" aria-live="polite">
                <span className="conversion-spinner" />
                <span>Converting your images…</span>
              </div>
            )}
          </div>

          <aside className="converter-sidebar" aria-label="Downloads and Aidxn Design">
            <section className="results-panel" aria-labelledby="results-title">
              <div className="results-heading">
                <div>
                  <p className="app-eyebrow">{convertedImages.length > 0 ? 'READY TO DOWNLOAD' : 'YOUR WEBP FILES'}</p>
                  <h2 id="results-title">Downloads</h2>
                </div>
                {convertedImages.length > 0 && (
                  <div className="results-actions">
                    <span className="savings-total">{formatSize(totalSavings)} saved</span>
                    <button onClick={handleDownloadAll} disabled={isZipping} className="button-secondary">
                      <Package aria-hidden="true" />
                      <span>{isZipping ? 'Creating ZIP…' : 'Download all'}</span>
                    </button>
                  </div>
                )}
              </div>
              {convertedImages.length === 0 ? (
                <p className="results-empty">Your converted images will appear here, ready to download.</p>
              ) : (
                <div className="result-list">
                  {convertedImages.map((image, index) => (
                    <article key={`${image.originalName}-${index}`} className="result-row">
                      <div className="result-file-icon"><ImageIcon aria-hidden="true" /></div>
                      <div className="result-file-info">
                        <p className="result-filename">{image.originalName}.webp</p>
                        <p className="result-meta">
                          <span>{formatSize(image.originalSize)}</span>
                          <ArrowRight aria-hidden="true" />
                          <span>{formatSize(image.convertedSize)}</span>
                          <span className="result-savings">{calculateSavings(image.originalSize, image.convertedSize)} saved</span>
                        </p>
                      </div>
                      <div className="result-controls">
                        <button onClick={() => handleRemove(index)} className="icon-button" aria-label={`Remove ${image.originalName}`}>
                          <Trash2 aria-hidden="true" />
                        </button>
                        <button onClick={() => handleDownload(image)} className="button-secondary">
                          <Download aria-hidden="true" />
                          <span>Download</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            <section className="aidxn-cta" aria-labelledby="aidxn-cta-title">
              <div className="cta-ascii" aria-hidden="true">
                <AsciiFx mode="wave" speed={0.18} cell={13} accentGradient className="absolute inset-0" />
              </div>
              <div className="cta-content">
                <p className="app-eyebrow">AIDXN DESIGN</p>
                <h2 id="aidxn-cta-title">Everything your business needs online.</h2>
                <div className="cta-actions">
                  <a href="https://aidxn.com/web-design/" target="_blank" rel="noreferrer" className="button-primary">
                    Website Design <ArrowRight aria-hidden="true" />
                  </a>
                  <a href="https://ui.aidxn.com/components/" target="_blank" rel="noreferrer" className="button-quiet">
                    VX Components
                  </a>
                </div>
                <div className="cta-secondary-links">
                  <a href="https://aidxn.com/services/" target="_blank" rel="noreferrer">View all services</a>
                  <a href="https://aidxn.com/enquire/" target="_blank" rel="noreferrer">Start a project</a>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default Home;
