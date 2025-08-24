'use client';

import Script from 'next/script';
import { useEffect } from 'react';

export default function ClientScripts() {
  useEffect(() => {
    // Theme initialization - only runs on client
    try {
      const theme = localStorage.getItem('theme');
      if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.warn('Theme initialization error:', error);
    }
  }, []);

  return (
    <>
      {/* Google Analytics */}
      {process.env.NEXT_PUBLIC_GA_ID && (
        <>
          <Script 
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                page_title: 'Rifa Silverado Z71 2024 - Página Principal',
                page_location: window.location.href,
                custom_map: {
                  'custom_parameter_1': 'rifa_silverado'
                }
              });
            `}
          </Script>
        </>
      )}

      {/* Ecommerce Tracking */}
      <Script id="ecommerce-tracking" strategy="afterInteractive">
        {`
          window.raffleTracking = {
            ticketSelected: function(ticketNumber, totalSelected) {
              if (typeof gtag !== 'undefined') {
                gtag('event', 'select_item', {
                  event_category: 'rifa_tickets',
                  event_label: 'ticket_' + ticketNumber,
                  value: totalSelected
                });
              }
            },
            purchaseStarted: function(ticketCount, totalValue) {
              if (typeof gtag !== 'undefined') {
                gtag('event', 'begin_checkout', {
                  event_category: 'rifa_purchase',
                  event_label: 'checkout_started',
                  value: totalValue,
                  currency: 'MXN'
                });
              }
            }
          };
        `}
      </Script>
    </>
  );
}