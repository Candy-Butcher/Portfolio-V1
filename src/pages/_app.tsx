// src/pages/_app.tsx
import { type AppType } from "next/dist/shared/lib/utils";
import "@/styles/globals.css";
import "@/styles/locomotive-scroll.css";
import "@/styles/ProfileCard.css";  
import dynamic from "next/dynamic";
import { DM_Sans } from "next/font/google";
import '@/styles/magic-bento.css';
import Head from "next/head";






const dmSans = DM_Sans({ display: "swap", subsets: ["latin"] });

// DotGrid uses canvas + window events → client-only
const DotGrid = dynamic(() => import("@/components/DotGrid"), { ssr: false });
const ViewportBottomBlur = dynamic(
  () => import("@/components/ViewportBottomBlur"),
  { ssr: false }
);

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
    <Head>
        <title>Aman Chandre — Game Designer</title>
        <meta name="description" content="Game Designer" />

        {/* Favicons */}
      
        <link rel="icon" type="image/png" sizes="16x16" href="assets/weblogo.png" />
      
      </Head>
      {/* site-wide background (never blocks clicks) */}
      <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
        {/* no fixed height; fill the viewport */}
        <div className="h-full w-full opacity-100">
          <DotGrid
            dotSize={5}
            gap={20}
            baseColor="#64646607"     // darker indigo
            activeColor="#5227FF"  // very light periwinkle → visible “glow”
            proximity={120}
	    shockRadius={250}
    shockStrength={5}
    resistance={750}
    returnDuration={1.5}
	// opacity={0.22}
            // if you added the opacity prop per my earlier note:
            
            className="block p-0 h-full w-full"  // overrides the component's default p-4/flex
          />
        </div>
      </div>


 {/* Always-on bottom-of-viewport blur */}
      <ViewportBottomBlur />


      <div lang="en" className={dmSans.className}>
        <Component {...pageProps} />
      </div>

<footer className="mb-[calc(6rem+1rem+env(safe-area-inset-bottom))]">
  {/* footer text */}
</footer>

    </>
  );
};



export default MyApp;
