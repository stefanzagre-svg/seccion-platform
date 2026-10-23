"use client";

import Script from "next/script";

/**
 * Meta (Instagram) + TikTok + X (Twitter) pixels, consent-gated (GDPR / Spain).
 * They only collect after the visitor accepts the cookie banner
 * (localStorage `seccion_cookie_consent`). CookieConsentBanner calls grant/revoke.
 */
const META_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "4537170363228364";
const TIKTOK_ID = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || "DB11RQRC77U5DCODBVT0";
const X_PIXEL_ID = process.env.NEXT_PUBLIC_X_PIXEL_ID || "rfcrb";

export default function AdPixels() {
  return (
    <>
      {META_ID && (
        <Script id="meta-pixel" strategy="afterInteractive">{`
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
var c=localStorage.getItem('seccion_cookie_consent');fbq('consent',c==='accepted'?'grant':'revoke');
fbq('init','${META_ID}');fbq('track','PageView');`}</Script>
      )}
      <Script id="tiktok-pixel" strategy="afterInteractive">{`
!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)};
ttq.holdConsent();
var c=localStorage.getItem('seccion_cookie_consent');
if(c==='accepted')ttq.grantConsent();else if(c==='rejected')ttq.revokeConsent();
ttq.load('${TIKTOK_ID}');ttq.page();}(window,document,'ttq');`}</Script>
      {X_PIXEL_ID && (
        <Script id="x-pixel" strategy="afterInteractive">{`
!function(e,t,n,s,u,a){e.twq||(s=e.twq=function(){s.exe?s.exe.apply(s,arguments):s.queue.push(arguments);
},s.version='1.1',s.queue=[],u=t.createElement(n),u.async=!0,u.src='https://static.ads-twitter.com/uwt.js',
a=t.getElementsByTagName(n)[0],a.parentNode.insertBefore(u,a))}(window,document,'script');
twq('config','${X_PIXEL_ID}');
twq('event','page_view');`}</Script>
      )}
    </>
  );
}
