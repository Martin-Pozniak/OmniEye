import React, { useEffect, useState } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { PuffLoader } from 'react-spinners';

interface VisitorData {
  visitorId: string;
  ip?: string;
  city?: string;
  region?: string;
  country?: string;
  org?: string;
  userAgent: string;
  language: string;
  platform: string;
  screen: string;
  timezone: string;
  hardwareConcurrency: number;
  deviceMemory?: number;
  touchSupport: boolean;
  plugins: string[];
  connection?: string;
  battery?: string;
  doNotTrack?: string;
  storageQuotaMB?: number;
  incognito?: boolean;
  canvasFingerprint?: string;
  webglVendor?: string;
  webglRenderer?: string;
}

export default function SystemFingerprint() {

  const [m_cVisitorData, set_cVisitorData] = useState<VisitorData | null>(null);

  const [m_bUserSummaryLoading, set_bLoading] = useState(true);
  const [m_cUserSummary, set_cUserSummary] = useState<any>(null);



  useEffect(() => {
    const LoadVisitorData = async () => {
      const m_cFpAgent = await FingerprintJS.load();
      const m_cResult = await m_cFpAgent.get();

      const m_cPlugins = navigator.plugins
        ? Array.from(navigator.plugins).map(p => p.name)
        : [];

      const m_bTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

      let m_cIPData: Partial<VisitorData> = {};
      try {
        const m_cResp = await fetch('https://ipwho.is/');
        const m_cJson = await m_cResp.json();
        m_cIPData = {
          ip: m_cJson.ip,
          city: m_cJson.city,
          region: m_cJson.region,
          country: m_cJson.country,
          org: m_cJson.connection?.org,
        };
      } catch {}

      const m_cBattery = await (navigator as any).getBattery?.().catch(() => null);

      const m_cStorage = await navigator.storage?.estimate?.().catch(() => null);
      const m_bIncognito = m_cStorage && m_cStorage.quota < 120000000;

      const canvasFingerprint = (() => {
        try {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.textBaseline = 'top';
            ctx.font = '14px Arial';
            ctx.fillText('FingerprintTest', 2, 2);
            return canvas.toDataURL();
          }
        } catch {}
        return undefined;
      })();

      const getWebGLInfo = () => {
        try {
          const canvas = document.createElement('canvas');
          const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
          const debugInfo = gl?.getExtension('WEBGL_debug_renderer_info');
          const vendor = gl?.getParameter(debugInfo?.UNMASKED_VENDOR_WEBGL || '') || 'Unknown';
          const renderer = gl?.getParameter(debugInfo?.UNMASKED_RENDERER_WEBGL || '') || 'Unknown';
          return { vendor, renderer };
        } catch {
          return { vendor: 'Unavailable', renderer: 'Unavailable' };
        }
      };

      const { vendor: webglVendor, renderer: webglRenderer } = getWebGLInfo();

      set_cVisitorData({
        ...m_cIPData,
        visitorId: m_cResult.visitorId,
        userAgent: navigator.userAgent,
        language: navigator.language,
        platform: navigator.platform,
        screen: `${window.screen.width}x${window.screen.height} (${window.screen.colorDepth}bit)`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hardwareConcurrency: navigator.hardwareConcurrency,
        deviceMemory: (navigator as any).deviceMemory,
        touchSupport: m_bTouch,
        plugins: m_cPlugins,
        connection: (navigator as any).connection?.effectiveType,
        battery: m_cBattery
          ? `${Math.round(m_cBattery.level * 100)}% ${m_cBattery.charging ? '(charging)' : ''}`
          : 'Unavailable',
        doNotTrack: navigator.doNotTrack,
        storageQuotaMB: m_cStorage?.quota ? Math.round(m_cStorage.quota / 1024 / 1024) : undefined,
        incognito: m_bIncognito,
        canvasFingerprint,
        webglVendor,
        webglRenderer,
      });

    };

    LoadVisitorData();
  }, []);

  useEffect(() => {
    if (m_cVisitorData) {
      const fetchUserSummary = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/user/summary', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(m_cVisitorData),
          });

          if (response.ok) {
            const data = await response.json();
            set_cUserSummary(data.analysis.toString());
          } else {
            console.error('Failed to fetch user summary:', response.statusText);
          }
        } catch (error) {
          console.error('Error fetching user summary:', error);

          set_cUserSummary('An error occurred while fetching the user summary. Please try again later.');

        } finally {
          set_bLoading(false);
        }
      };

      set_bLoading(true);

      fetchUserSummary();
    }
  }, [m_cVisitorData]);

  if (!m_cVisitorData) return <div>Loading full visitor info...</div>;

  return (
    <div>
      <p className='mt-5'>Just by visiting this website here is what we can tell about you:</p>

      {m_cVisitorData && (
        <div>

          {m_bUserSummaryLoading ? (
                                <PuffLoader color="#3B82F6" loading={m_bUserSummaryLoading} size={50} />

          ) : (
            m_cUserSummary && (
              <div>
                  <p className="whitespace-pre-wrap text-sm ">
                    <strong>
                      {m_cUserSummary}
                    </strong>
                  </p>
              </div>
            )
          )}

        </div>
      )}

      <h3 className='mt-5'>Technical fingerprint</h3>
      <p style={{ fontSize: '0.9rem', color: '#888' }}>
        Below is a detailed technical fingerprint of your system. This information is what websites can see about you by default. 
        It is not personally identifiable information (PII) but it can be used to track you. Mixed with other data, it could be used to identify you.
        <br />
      </p>

      <ul className=" overflow-y-auto border border-gray-300 bg-gray-100 p-4 rounded text-black">
        <li><strong>IP:</strong> {m_cVisitorData.ip}</li>
        <li><strong>Location:</strong> {m_cVisitorData.city}, {m_cVisitorData.region}, {m_cVisitorData.country}</li>
        <li><strong>ISP:</strong> {m_cVisitorData.org}</li>
        <li><strong>Visitor ID:</strong> {m_cVisitorData.visitorId}</li>
        <li><strong>User Agent:</strong> {m_cVisitorData.userAgent}</li>
        <li><strong>Language:</strong> {m_cVisitorData.language}</li>
        <li><strong>Platform:</strong> {m_cVisitorData.platform}</li>
        <li><strong>Screen:</strong> {m_cVisitorData.screen}</li>
        <li><strong>Timezone:</strong> {m_cVisitorData.timezone}</li>
        <li><strong>CPU Cores:</strong> {m_cVisitorData.hardwareConcurrency}</li>
        <li><strong>Memory:</strong> {m_cVisitorData.deviceMemory || 'Unknown'} GB</li>
        <li><strong>Touch Support:</strong> {m_cVisitorData.touchSupport ? 'Yes' : 'No'}</li>
        <li><strong>Connection:</strong> {m_cVisitorData.connection}</li>
        <li><strong>Battery:</strong> {m_cVisitorData.battery}</li>
        <li><strong>Do Not Track:</strong> {m_cVisitorData.doNotTrack}</li>
        <li><strong>Storage Quota:</strong> {m_cVisitorData.storageQuotaMB} MB</li>
        <li><strong>Incognito:</strong> {m_cVisitorData.incognito ? 'Possibly' : 'No'}</li>
        <li><strong>Canvas Fingerprint:</strong> {m_cVisitorData.canvasFingerprint?.slice(0, 32)}...</li>
        <li><strong>WebGL Vendor:</strong> {m_cVisitorData.webglVendor}</li>
        <li><strong>WebGL Renderer:</strong> {m_cVisitorData.webglRenderer}</li>
        <li><strong>Plugins:</strong>
          <ul>{m_cVisitorData.plugins.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </li>
      </ul>
    </div>
  );

}