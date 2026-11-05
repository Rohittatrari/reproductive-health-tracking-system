import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share2, PlusSquare } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already running as installed standalone app
    const isApp = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(isApp);

    if (isApp) return;

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for Chrome/Edge/Android install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // If on iOS and not standalone, show prompt after 2 seconds
    if (isIosDevice && !isApp) {
      const dismissed = localStorage.getItem('dismissed_install_banner');
      if (!dismissed) {
        setShowPrompt(true);
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('dismissed_install_banner', 'true');
  };

  if (isStandalone || !showPrompt) return null;

  return (
    <>
      {/* Floating or Top Install Banner */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-40 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-purple-200 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-purple-950">Add to Home Screen</h4>
              <p className="text-xs text-purple-600 mt-0.5">
                Install AuraHealth on your device for instant, one-tap access like a native app.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2">
          <button
            onClick={handleDismiss}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-purple-700 hover:bg-purple-50"
          >
            Not Now
          </button>
          <button
            onClick={handleInstallClick}
            className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm shadow-purple-200 transition-all flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install App</span>
          </button>
        </div>
      </div>

      {/* iOS Safari Instruction Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-purple-100 text-center">
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center mx-auto mb-3">
              <Share2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-purple-950">Add to Home Screen on iOS</h3>
            <div className="text-xs text-purple-900/80 text-left mt-3 space-y-2.5 bg-purple-50/70 p-3.5 rounded-2xl border border-purple-100">
              <p className="flex items-center gap-2">
                <span className="font-bold text-purple-700 bg-white w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-purple-200">1</span>
                <span>Tap the <b>Share button</b> (<Share2 className="w-3.5 h-3.5 inline mx-0.5 text-blue-600" />) in Safari's bottom toolbar.</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-bold text-purple-700 bg-white w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-purple-200">2</span>
                <span>Scroll down and tap <b>'Add to Home Screen'</b> (<PlusSquare className="w-3.5 h-3.5 inline mx-0.5 text-purple-600" />).</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="font-bold text-purple-700 bg-white w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-purple-200">3</span>
                <span>Tap <b>Add</b> in the top right corner.</span>
              </p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
}
