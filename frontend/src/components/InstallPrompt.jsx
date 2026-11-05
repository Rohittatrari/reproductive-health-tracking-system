import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Share2, PlusSquare, Monitor, CheckCircle, Apple } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already running as installed standalone app
    const isApp = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(isApp);

    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for Chrome/Edge/Android install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem('dismissed_install_banner');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Listen for custom trigger from Header or Sidebar "Install App" button
    const openGuideHandler = () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(({ outcome }) => {
          if (outcome === 'accepted') {
            setShowPrompt(false);
          }
          setDeferredPrompt(null);
        });
      } else {
        setShowGuideModal(true);
      }
    };
    window.addEventListener('open-install-guide', openGuideHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('open-install-guide', openGuideHandler);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowGuideModal(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('dismissed_install_banner', 'true');
  };

  return (
    <>
      {/* Floating Bottom Card (If not already installed and not dismissed) */}
      {!isStandalone && showPrompt && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-40 bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-5 shadow-2xl border border-purple-200 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3.5">
              <img
                src="./icon-192.png"
                alt="AuraHealth"
                className="w-12 h-12 rounded-2xl shadow-md border border-purple-100 shrink-0"
              />
              <div>
                <h4 className="font-bold text-sm text-purple-950">Install AuraHealth</h4>
                <p className="text-xs text-purple-600 mt-0.5 leading-snug">
                  Save to your home screen for quick, offline access and a native app experience.
                </p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              onClick={handleDismiss}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-purple-700 hover:bg-purple-50"
            >
              Later
            </button>
            <button
              onClick={handleInstallClick}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-200 transition-all flex items-center gap-1.5 hover:scale-[1.02]"
            >
              <Download className="w-4 h-4" />
              <span>Add to Home Screen</span>
            </button>
          </div>
        </div>
      )}

      {/* Interactive Comprehensive Install Guide Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-purple-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-purple-100">
              <div className="flex items-center gap-3">
                <img
                  src="./icon-192.png"
                  alt="AuraHealth Icon"
                  className="w-11 h-11 rounded-2xl shadow-sm border border-purple-100"
                />
                <div>
                  <h3 className="font-bold text-lg text-purple-950">Save to Home Screen</h3>
                  <p className="text-xs text-purple-500">Add AuraHealth as a standalone application</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              {/* iOS Guide */}
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-100">
                <div className="flex items-center gap-2 mb-2 font-bold text-sm text-purple-950">
                  <Apple className="w-4 h-4 text-purple-700" />
                  <span>iPhone / iPad (Safari)</span>
                </div>
                <div className="text-xs text-purple-900/80 space-y-2">
                  <p className="flex items-center gap-2">
                    <span className="font-bold text-purple-700 bg-white w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-purple-200">1</span>
                    <span>Tap the <b>Share icon</b> (<Share2 className="w-3.5 h-3.5 inline text-blue-600" />) in Safari's bottom bar.</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-bold text-purple-700 bg-white w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-purple-200">2</span>
                    <span>Scroll down and tap <b>'Add to Home Screen'</b> (<PlusSquare className="w-3.5 h-3.5 inline text-purple-600" />).</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-bold text-purple-700 bg-white w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-purple-200">3</span>
                    <span>Tap <b>Add</b> in the top-right corner.</span>
                  </p>
                </div>
              </div>

              {/* Android Guide */}
              <div className="p-4 rounded-2xl bg-pink-50/60 border border-pink-100">
                <div className="flex items-center gap-2 mb-2 font-bold text-sm text-pink-950">
                  <Smartphone className="w-4 h-4 text-pink-600" />
                  <span>Android (Chrome / Edge / Samsung)</span>
                </div>
                <div className="text-xs text-pink-950/80 space-y-2">
                  <p className="flex items-center gap-2">
                    <span className="font-bold text-pink-700 bg-white w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-pink-200">1</span>
                    <span>Tap the <b>3 dots menu</b> (⋮) in the top right corner.</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-bold text-pink-700 bg-white w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-pink-200">2</span>
                    <span>Select <b>'Install app'</b> or <b>'Add to Home screen'</b>.</span>
                  </p>
                </div>
              </div>

              {/* Desktop Windows/Mac Guide */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-100">
                <div className="flex items-center gap-2 mb-2 font-bold text-sm text-indigo-950">
                  <Monitor className="w-4 h-4 text-indigo-600" />
                  <span>Desktop (Chrome / Edge on Windows & Mac)</span>
                </div>
                <div className="text-xs text-indigo-950/80 space-y-2">
                  <p className="flex items-center gap-2">
                    <span className="font-bold text-indigo-700 bg-white w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-indigo-200">1</span>
                    <span>Click the <b>Install App icon</b> (<Download className="w-3.5 h-3.5 inline text-indigo-600" />) in the address bar.</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="font-bold text-indigo-700 bg-white w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-indigo-200">2</span>
                    <span>Click <b>Install</b> to launch AuraHealth as a desktop application.</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowGuideModal(false)}
                className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm transition-all"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
