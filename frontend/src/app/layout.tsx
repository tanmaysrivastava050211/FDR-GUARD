import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/Navbar";
import { ScrollToTopListener } from "@/components/ScrollToTopListener";

export const metadata: Metadata = {
  title: "FDR-GUARD — AICTE Centralized Security Deposit & FDR Management Portal",
  description: "Official National Portal for Fixed Deposit Receipt (FDR) Verification and Security Deposit Management. All India Council for Technical Education (Ministry of Education, Govt. of India).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#f4f6fa] text-slate-800 flex flex-col antialiased">
        <ScrollToTopListener />
        <AuthProvider>
          <Navbar />
          
          {/* Main Content Workspace */}
          <main className="flex-1 w-full flex flex-col">
            {children}
          </main>

          {/* OFFICIAL GOVERNMENT FOOTER (NIC / AICTE Standards - Clean Light Layout) */}
          <footer className="mt-auto bg-white border-t border-slate-300 text-slate-600 text-xs shadow-inner">
            {/* National Tricolor Line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808] border-b border-slate-200" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-slate-200 text-[12px]">
                
                {/* Column 1: Authority Info */}
                <div className="space-y-1.5">
                  <p className="font-bold text-[#0c2340] text-xs uppercase tracking-wide">
                    AICTE Headquarters
                  </p>
                  <p className="text-slate-600 leading-relaxed">
                    Nelson Mandela Marg, Vasant Kunj,<br />
                    New Delhi - 110070
                  </p>
                  <p className="text-slate-600">
                    Phone: <a href="tel:01129581000" className="font-semibold text-slate-800 hover:text-blue-700 hover:underline">011-29581000</a><br />
                    Email: <a href="mailto:support-fdr@aicte-india.org" className="font-semibold text-blue-700 hover:underline">support-fdr@aicte-india.org</a>
                  </p>
                </div>

                {/* Column 2: Official Links */}
                <div className="space-y-1.5">
                  <p className="font-bold text-[#0c2340] text-xs uppercase tracking-wide">
                    Statutory Regulations
                  </p>
                  <p><Link href="/policies#aph" className="hover:text-blue-700 hover:underline">Approval Process Handbook (APH 2026-27)</Link></p>
                  <p><Link href="/policies#directives" className="hover:text-blue-700 hover:underline">Joint Lien Regulatory Directives</Link></p>
                  <p><Link href="/policies#banks" className="hover:text-blue-700 hover:underline">Approved Scheduled Banks List</Link></p>
                  <p><Link href="/policies#circulars" className="hover:text-blue-700 hover:underline">Council Notifications &amp; Circulars</Link></p>
                </div>

                {/* Column 3: E-Governance & Transparency */}
                <div className="space-y-1.5">
                  <p className="font-bold text-[#0c2340] text-xs uppercase tracking-wide">
                    Policies &amp; Legal
                  </p>
                  <p><Link href="/policies#rti" className="hover:text-blue-700 hover:underline">Right to Information (RTI)</Link></p>
                  <p><Link href="/policies#terms" className="hover:text-blue-700 hover:underline">Terms of Service &amp; Disclaimer</Link></p>
                  <p><Link href="/policies#hyperlinking" className="hover:text-blue-700 hover:underline">Hyperlinking Policy</Link></p>
                  <p><Link href="/policies#security" className="hover:text-blue-700 hover:underline">Website Security Audit Compliance</Link></p>
                </div>

                {/* Column 4: Platform Certification */}
                <div className="space-y-2">
                  <p className="font-bold text-[#0c2340] text-xs uppercase tracking-wide">
                    Platform Specifications
                  </p>
                  <p className="text-slate-600">
                    Portal: <strong>AICTE FDR-Guard Portal</strong><br />
                    Standard: <Link href="/policies#aph" className="hover:text-blue-700 hover:underline"><strong>APH 2026-27 Joint Lien Directives</strong></Link><br />
                    Infrastructure: <a href="https://www.nic.in" target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 hover:underline"><strong>National Informatics Centre (NIC)</strong></a>
                  </p>
                  <Link href="/policies#security" className="inline-block px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[11px] text-slate-800 font-medium transition-colors">
                    MeghRaj Cloud Certified • STQC Compliant
                  </Link>
                </div>

              </div>

              {/* Bottom Copyright & Disclaimer */}
              <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-600 gap-2 border-t border-slate-200 mt-2">
                <p>
                  © 2026 <strong>All India Council for Technical Education (AICTE)</strong>, Ministry of Education, Government of India. <span className="font-bold text-slate-800">All Rights Reserved (सर्वाधिकार सुरक्षित)</span>.
                </p>
                <p>
                  Official National Statutory Portal • Designed, Developed &amp; Hosted by AICTE / NIC • <span className="font-semibold text-slate-700">All Rights Reserved</span>
                </p>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
