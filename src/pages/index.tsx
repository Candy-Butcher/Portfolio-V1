import Container from "@/components/Container";
import { useEffect, useRef, Suspense, useState } from "react";
import styles from "@/styles/Home.module.css";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { TriangleDownIcon } from "@radix-ui/react-icons";
import Spline from "@splinetool/react-spline";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import VanillaTilt from "vanilla-tilt";
import SpotlightCard from "@/components/SpotlightCard";
import dynamic from "next/dynamic";
import StarBorder from "@/components/StarBorder";
import GradientText from "@/components/GradientText";
import MagicBento, { type BentoCardProps } from "@/components/MagicBento";
// ⬇️ changed line: named import
import ProjectGallery from "@/components/ProjectGallery";

const ProfileCard = dynamic(() => import("@/components/ProfileCard"), {
  ssr: false,
});

const aboutStats = [
  { label: "Years of experience", value: "4+" },
  { label: "Technologies mastered", value: "5+" },
];

const SKILL_GROUPS: { title: string; items: string[] }[] = [
  {
    title: "Gameplay & AI Design",
    items: [
      "Combat systems",
      "Gameplay Ability System (GAS)",
      "AI behavior trees",
      "State machines",
      "Enemy behaviors",
      "Pickups & inventory",
      "Gameplay tuning & balance",
      "Greyboxing & blockout",
      "Playtest-driven iteration",
    ],
  },
  {
    title: "Game Engines & Technical Tools",
    items: [
      "Unreal Engine 5 / UEFN",
      "C++",
      "Blueprint",
      "Verse",
      "Unity (C#)",
      "AR/VR prototyping ",
      "Convai", 
      "Vuforia",
      "Maya",
      "TouchDesigner",
    ],
  },
  {
    title: "UI & Player Experience",
    items: [
      "UI systems (HUDs, menus, flows)",
      "Reusable UI components",
      "UI animation & motion feedback",
      "Interaction clarity",
      "Accessibility-focused UX",
      "Usability testing",
      "Game Design Documents (GDDs)",
    ],
  },
  {
    title: "Narrative & Experiential Design",
    items: [
      "Interactive storytelling",
      "Environmental pacing",
      "Emotional gameplay design",
      "Narrative-driven spaces",
      "Player guidance (layout & mechanics)",
    ],
  },
  {
    title: "Design & Prototyping Tools",
    items: ["Figma", "Adobe After Effects", "Adobe Photoshop"],
  },
  {
    title: "Collaboration & Production",
    items: [
      "Cross-disciplinary teamwork",
      "Git workflows",
      "Rapid prototyping",
      "Agile-style iteration",
      "Playtest documentation",
    ],
  },
];

/* ---------------------------------------------------
   Helpers for compact project definitions (#3—#16)
-----------------------------------------------------*/
type GalleryItem = {
  src: string;
  type: "image" | "video";
  alt?: string;
  poster?: string;
};

type BasicProject = {
  label: string;               // "#3", "#4", ...
  heroTitle: string;
  tools: string;
  length?: string;
  description: string;
  keyContrib: string[];
  skills: string[];
  backgroundUrl?: string;
  backgroundPosition?: string;
  scrim?: "radial" | "linear" | false;
  frosted?: boolean;

  /** per-project visuals (override). If omitted, falls back to DEFAULT_VISUALS */
  galleryItems?: GalleryItem[];
  galleryThumbHeight?: number;
};

/** Fallback visuals (used only when a project doesn't supply galleryItems) */
const DEFAULT_VISUALS: BentoCardProps = {
  label: "Visuals",
  className:
    "col-span-12 lg:col-start-1 lg:col-span-12 lg:row-start-3 lg:row-span-2",
  description: (
    <ProjectGallery
      items={[
        // { src: "/assets/vis/moses-01.jpg", type: "image", alt: "Museum scene 1" },
        // { src: "/assets/vis/moses-02.jpg", type: "image", alt: "Museum scene 2" },
        {
          src: "/assets/projects/moses/thesis.mp4",
          type: "video",
          poster: "/assets/projects/moses/project2.png",
        },
        // { src: "/assets/vis/moses-03.jpg", type: "image", alt: "Dialogue system" },
      ]}
      thumbHeight={220}
    />
  ),
};

function visualsCard(
  items: GalleryItem[],
  thumbHeight = 220
): BentoCardProps {
  return {
    label: "Visuals",
    className:
      "col-span-12 lg:col-start-1 lg:col-span-12 lg:row-start-3 lg:row-span-2",
    description: <ProjectGallery items={items} thumbHeight={thumbHeight} />,
  };
}

function makeCards(p: BasicProject): BentoCardProps[] {
  const hero: BentoCardProps = {
    label: p.label,
    className:
      "col-span-12 lg:col-start-1 lg:col-span-10 lg:row-start-1 lg:row-span-1",
    backgroundFit: "cover",
    // unify framing & frosted for all projects; allow background override
    backgroundUrl: p.backgroundUrl ?? "/assets/projects/pygon/hero.jpg",
    backgroundPosition: p.backgroundPosition ?? "50% 35%",
    scrim: p.scrim ?? "radial",
    frosted: p.frosted ?? true,
    title: (
      <div className="space-y-3">
        <h2 className="text-3xl md:text-4xl font-semibold leading-tight">
          {p.heroTitle}
        </h2>
        <p className="text-sm opacity-95">
          <strong>Engine &amp; Tools:</strong> {p.tools}
          {p.length ? (
            <>
              <br />
              <strong>Project Length:</strong> {p.length}
            </>
          ) : null}
        </p>
      </div>
    ),
  };

  const visuals =
    p.galleryItems && p.galleryItems.length > 0
      ? visualsCard(p.galleryItems, p.galleryThumbHeight)
      : DEFAULT_VISUALS;

  return [
    hero,
    {
      label: "Key Skills Demonstrated",
      className:
        "col-span-12 lg:col-start-11 lg:col-span-2 lg:row-start-1 lg:row-span-1",
      description: (
        <ul className="list-disc pl-5 space-y-1 text-sm opacity-90">
          {p.skills.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      ),
    },
    {
      label: "Description & Gameplay Logic",
      className:
        "col-span-12 md:col-span-6 lg:col-start-1 lg:col-span-6 lg:row-start-2 lg:row-span-1",
      description: <p className="text-sm leading-6 opacity-90">{p.description}</p>,
    },
    {
      label: "Key Contributions",
      className:
        "col-span-12 md:col-span-6 lg:col-start-7 lg:col-span-6 lg:row-start-2 lg:row-span-1",
      description: (
        <ul className="list-disc pl-5 space-y-1 text-sm opacity-90">
          {p.keyContrib.map((c) => (
            <li key={c.slice(0, 40)}>{c}</li>
          ))}
        </ul>
      ),
    },
    visuals,
  ];
}

/* ---------------------------------------------------
   Project #1 — Moses
-----------------------------------------------------*/
const mosesCards: BentoCardProps[] = [
  {
    label: "#1",
    className:
      "col-span-12 lg:col-start-1 lg:col-span-10 lg:row-start-1 lg:row-span-1",
    backgroundUrl: "/assets/projects/moses/project2.png",
    backgroundPosition: "50% 35%", // unified framing
    backgroundFit: "cover",
    scrim: "radial",
    frosted: true, // unified frosted
    title: (
      <div className="space-y-3">
        <h2 className="text-3xl md:text-4xl font-semibold leading-tight">
          AI Representation of Moses Williams at Peale’s Philadelphia Museum
        </h2>
        <p className="text-sm opacity-95">
          <strong>Engine &amp; Tools:</strong> Unity (2022.3.18f1), Convai, custom
          dataset design, narrative scripting, AI-assisted editorial tools (ChatGPT, GitHub Copilot, MidJourney)
          <br />
          <strong>Project Length:</strong> 6 months
        </p>
      </div>
    ),
  },
  {
    label: "Key Skills Demonstrated",
    className:
      "col-span-12 lg:col-start-11 lg:col-span-2 lg:row-start-1 lg:row-span-1",
    description: (
      <ul className="list-disc pl-5 space-y-1 text-sm opacity-90">
        <li>Narrative design (branching dialogue, educational scaffolding)</li>
        <li>Systems design (player choice loop with fact/speculation/silence outcomes)</li>
        <li>Iteration & testing (evaluation rounds with experts + pilot users)</li>
        <li>Research integration (archival data, ethical frameworks applied to gameplay)
</li>
      </ul>
    ),
  },
  {
    label: "Description & Interaction Logic",
    className:
      "col-span-12 md:col-span-6 lg:col-start-1 lg:col-span-6 lg:row-start-2 lg:row-span-1",
    description: (
      <p className="text-sm leading-6 opacity-90">
        A graduate thesis project that explores how AI can represent marginalised
        historical figures whose voices are missing from the archive. The prototype builds a
        conversational AI of Moses Williams (c.1775–1825)… Dialogue separates facts,
        speculation, and archival silences to prompt critical reflection.
      </p>
    ),
  },
  {
    label: "Key Contributions",
    className:
      "col-span-12 md:col-span-6 lg:col-start-7 lg:col-span-6 lg:row-start-2 lg:row-span-1",
    description: (
      <ul className="list-disc pl-5 space-y-1 text-sm opacity-90">
        <li>Designed the core interaction loop revealing fact/speculation/silence.</li>
        <li>Built a Unity museum scene integrated with Convai; iterated with experts.</li>
        <li>Balanced branching dialogue pacing via 15+ pilot tests.</li>
        <li>Created a bespoke historical dataset; kept interpretation transparent.</li>
        <li>Applied Hartman & Caswell frameworks to align ethics & narrative.</li>
      </ul>
    ),
  },
  // visuals (kept default — swap to a custom gallery if you want)
  DEFAULT_VISUALS,
];

/* ---------------------------------------------------
   Project #2 — Pygon
-----------------------------------------------------*/
const pygonCards: BentoCardProps[] = [
  ...makeCards({
    label: "#2",
    heroTitle: "The Legend of Pygon (released later as CodeStrike on Steam)",
    tools: "Unity, Figma (UI/UX), custom scripting",
    length: "8 months",
    description:
      "Educational adventure introducing Python through logic puzzles, storytelling, and interactive play; difficulty and rewards support young learners.",
    keyContrib: [
      "Designed puzzle loops tied to narrative progression.",
      "Ran 3 playtest rounds; tuned challenge order & rewards.",
      "Prototyped UI in Figma; refined placement/contrast/readability.",
      "Built/tuned VFX, sound, and lighting to guide focus.",
      "Aligned story beats with learning mechanics in a small team.",
    ],
    skills: [
      "Systems design (puzzle loops & progression)",
      "Iteration & playtesting with child users",
      "UI/UX prototyping for accessibility",
      "Narrative integration with learning goals",
      "Team collaboration",
    ],
    backgroundUrl: "/assets/projects/pygon/back.png",
    backgroundPosition: "40% 65%",
    frosted: true,
    // custom visuals for #2 (example)
    galleryItems: [
            { src: "/assets/projects/pygon/demo.mp4", type: "video", poster: "/assets/projects/pygon/pygon.png" },
      { src: "/assets/projects/pygon/back.png", type: "image", alt: "Pygon UI mock" },
            { src: "/assets/projects/pygon/pic2.png", type: "image", alt: "Pygon UI mock" },
      { src: "/assets/projects/pygon/pic3.png", type: "image", alt: "Pygon UI mock" },
      { src: "/assets/projects/pygon/pic4.png", type: "image", alt: "Pygon UI mock" },
      { src: "/assets/projects/pygon/pic5.png", type: "image", alt: "Pygon UI mock" },
      { src: "/assets/projects/pygon/pic6.png", type: "image", alt: "Pygon UI mock" },

      { src: "/assets/projects/pygon/pic7.png", type: "image", alt: "Puzzle screen" },
      // { src: "/assets/projects/pygon/shot3.jpg", type: "image", alt: "Gameplay moment" },
    ],
  }),
];

/* ---------------------------------------------------
   Projects #3 — #16 (each with its own visuals)
-----------------------------------------------------*/
const OTHER_PROJECTS: BasicProject[] = [
  {
    label: "#3",
    heroTitle: "AR Experience – Engage with The Office",
    tools: "Unity, Vuforia, Convai",
    length: "~6 weeks",
    description:
      "AR promotional prototype where barcode scans unlock AR scenes and a Convai-powered chat with Dwight Schrute. Demonstrates branded interactive experiences merging AR with conversational AI.",
    keyContrib: [
      "Built barcode→scene loop; iterated for fast, stable recognition.",
      "Integrated Convai; refined dialogue to feel authentic and on-brand.",
      "Optimised an explorable AR set for mobile performance.",
      "User-tested pacing; tuned dialogue length & transitions.",
    ],
    skills: [
      "Unity + Vuforia + Convai integration",
      "Systems design (barcode-triggered AR & dialogue pacing)",
      "Iteration & testing (recognition stability, timing)",
      "Performance optimisation for mobile AR",
      "Interactive marketing creativity",
    ],
    backgroundUrl: "/assets/projects/office/demo.png",
        backgroundPosition: "40% 65%",

    galleryItems: [
      // { src: "/assets/projects/office/shot1.jpg", type: "image", alt: "AR scan UI" },
      // { src: "/assets/projects/office/shot2.jpg", type: "image", alt: "AR scene 1" },
      { src: "/assets/projects/office/demo.mp4", type: "video", poster: "/assets/projects/office/demo.png" },
      // { src: "/assets/projects/office/shot3.jpg", type: "image", alt: "Dialogue with Dwight" },
    ],
  },
  {
    label: "#4",
    heroTitle: "Silk Road Chronicles",
    tools: "Unreal Engine 5 (Blueprints), 2D art, custom UI scripting",
    length: "~1.5 months",
    description:
      "Educational 2D platformer where inventory & trading choices drive progression while NPC dialogue delivers Silk Road history.",
    keyContrib: [
      "Designed levels encouraging exploration toward key trades.",
      "Built inventory & trading systems in Blueprints; tuned pacing.",
      "Balanced item values/trade frequency via multiple test runs.",
      "Designed readable inventory UI; refined after feedback.",
    ],
    skills: [
      "Systems design (inventory & trading loop)",
      "Level design & environment flow",
      "Balancing & iteration",
      "UI/UX for inventory clarity",
      "Narrative integration",
    ],
    backgroundUrl: "/assets/projects/silk/pic1.png",
            backgroundPosition: "40% 65%",

    galleryItems: [
            { src: "/assets/projects/silk/silk.mp4", type: "video", poster: "/assets/projects/silk/pic4.png" },
      { src: "/assets/projects/silk/pic1.png", type: "image", alt: "Market scene" },
      { src: "/assets/projects/silk/pic2.png", type: "image", alt: "Trade UI" },
            { src: "/assets/projects/silk/pic6.png", type: "image", alt: "Trade UI" },
      { src: "/assets/projects/silk/pic7.png", type: "image", alt: "Trade UI" },
      { src: "/assets/projects/silk/pic8.png", type: "image", alt: "Trade UI" },

      // { src: "/assets/projects/silk/shot3.jpg", type: "image", alt: "Platforming level" },
    ],
  },
  {
    label: "#5",
    heroTitle: "Exitless (Puzzle Prototype)",
    tools: "Unreal Engine 5",
    length: "~1 month",
    description:
      "First-person puzzle prototype featuring portal traversal and high-risk choices; wrong portals trigger stealth chase by 'weeping angel' enemies.",
    keyContrib: [
      "Designed portal traversal as core progression mechanic.",
      "Added high-risk decision points spawning enemies on errors.",
      "Tuned balance between puzzle flow and chase tension.",
      "Implemented all systems & AI solo within one month.",
    ],
    skills: [
      "Systems design (portal gating)",
      "Balancing risk/reward",
      "AI behaviour tuning",
      "End-to-end solo prototyping",
    ],
    backgroundUrl: "/assets/projects/exitless/pic1.png",
            backgroundPosition: "40% 65%",

    galleryItems: [
      
      { src: "/assets/projects/exitless/exitless.mp4", type: "video", poster: "/assets/projects/exitless/pic1.png" },
     
           { src: "/assets/projects/exitless/demo.mp4", type: "video", poster: "/assets/projects/exitless/pic3.png" },
 { src: "/assets/projects/exitless/pic2.png", type: "image", alt: "Puzzle hint" },
    ],
  },
  {
    label: "#6",
    heroTitle: "Exquisite Corpse – Whimsical Heights",
    tools: "Unity, C#, audio & environment tools",
    length: "2 weeks",
    description:
      "Class collab transforming an inherited surreal prototype into a replayable obstacle-course experience with Fall Guys vibes.",
    keyContrib: [
      "Expanded base into escalating obstacle-course loop.",
      "Iterated jump-pad timing & obstacle spacing via playtests.",
      "Built menu system (pause/replay/quit) and tested usability.",
      "Added SFX/ambience & smoother player animations.",
    ],
    skills: [
      "Systems design (escalating challenges)",
      "Iteration & testing",
      "UX for menus & flows",
      "Player feedback systems (animation/SFX/VFX)",
      "Adaptability on inherited code",
    ],
    backgroundUrl: "/assets/projects/exquisite/pic3.png",
            backgroundPosition: "40% 5%",

    galleryItems: [
      
      { src: "/assets/projects/exquisite/demo.mp4", type: "video", poster: "/assets/projects/exquisite/pic2.png" },
      { src: "/assets/projects/exquisite/pic1.png", type: "image", alt: "Menu UI" },
    ],
  },
  {
    label: "#7",
    heroTitle: "Purrfect Protector",
    tools: "Unity, Figma (UI/UX), audio tools",
    length: "~1.5 months",
    description:
      "Arcade prototype inspired by a Scottish folktale: clear a house of ghost mice under time pressure using power-ups and stylised feedback.",
    keyContrib: [
      "Designed time-limited core loop with escalating tension.",
      "Balanced spawn rates & power-ups through team testing.",
      "Built menus/overlays; refined for clarity in fast play.",
      "Added stylised VFX and tuned audio layers for feedback.",
    ],
    skills: [
      "Systems design (time-pressure arcade loop)",
      "Iteration & balancing",
      "UI/UX for fast-paced clarity",
      "Player feedback (VFX/audio)",
      "Narrative integration of folklore",
    ],
    backgroundUrl: "/assets/projects/purr/pic4.png",
            backgroundPosition: "40% 65%",

    frosted: true,
    galleryItems: [
     
      { src: "/assets/projects/purr/demo1.mp4", type: "video", poster: "/assets/projects/purr/pic2.png" },
            { src: "/assets/projects/purr/demo2.mp4", type: "video", poster: "/assets/projects/purr/pic3.png" },

      { src: "/assets/projects/purr/pic1.png", type: "image", alt: "Win screen" },
      
    ],
  },
  {
    label: "#8",
    heroTitle: "Companionship – Interactive Dog",
    tools: "Unreal Engine 5 (Blueprints, Behaviour Trees)",
    length: "~3 weeks",
    description:
      "Prototype companion dog with commands (follow, bark, fetch, sit) driven by a Behaviour Tree for responsive, natural reactions.",
    keyContrib: [
      "Built base behaviour tree & state transitions.",
      "Refined command responsiveness & animation timing.",
      "Designed extendable framework for new commands.",
      "Debugged & optimised Blueprint performance.",
    ],
    skills: [
      "AI systems design (behaviour trees)",
      "Team iteration & responsiveness tuning",
      "Systems architecture for extensibility",
      "Experience tuning (natural pacing)",
      "UE5 Blueprint fluency",
    ],
    backgroundUrl: "/assets/projects/dog/pic3.png",
            backgroundPosition: "40% 25%",

    galleryItems: [

      { src: "/assets/projects/dog/demo.mp4", type: "video", poster: "/assets/projects/dog/pic1.png" },
      { src: "/assets/projects/dog/pic2.png", type: "image", alt: "Fetch sequence" },
            { src: "/assets/projects/dog/pic3.png", type: "image", alt: "Fetch sequence" },

    ],
  },
  {
    label: "#9",
    heroTitle: "Frames of the Mind",
    tools: "Unreal Engine 5",
    length: "~2.5 weeks",
    description:
      "Experimental collaboration merging photography & games; players explore dreamlike spaces with a disruptive 'memory burn' mechanic.",
    keyContrib: [
      "Designed the 'memory burn' and tuned timing/intensity.",
      "Built surreal spaces blending photographic elements.",
      "Adjusted pacing via layout; avoided disorientation.",
      "Aligned mechanics to artistic intent with a videographer.",
    ],
    skills: [
      "Experimental systems (disruptive mechanic)",
      "Environmental design (surreal blends)",
      "Iteration on pacing & transitions",
      "Cross-disciplinary collaboration",
      "Atmosphere design (AV layers)",
    ],
    backgroundUrl: "/assets/projects/frames/pic1.png",
            backgroundPosition: "40% 5%",

    frosted: true,
    galleryItems: [
   
      { src: "/assets/projects/frames/ram.mp4", type: "video", poster: "/assets/projects/frames/pic1.png" },
      { src: "/assets/projects/frames/pic2.png", type: "image", alt: "Photo blend room" },
            { src: "/assets/projects/frames/pic3.png", type: "image", alt: "Photo blend room" },

    ],
  },
  {
    label: "#10",
    heroTitle: "Eva’s Dream",
    tools: "Unreal Engine 5",
    length: "1 week",
    description:
      "Narrative puzzle built around Kishōtenketsu. Orb collection unlocks doors toward a cinematic twist ending; emphasis on mood & pacing.",
    keyContrib: [
      "Designed orb→door progression & rising tension.",
      "Iterated placements to keep momentum.",
      "Built cutscenes delivering the twist; tuned timing.",
      "Crafted sound/lighting for emotional impact.",
    ],
    skills: [
      "Narrative design (Kishōtenketsu)",
      "Progression loop design",
      "Rapid playtest iteration",
      "Emotional audio/lighting design",
      "End-to-end one-week build",
    ],
    backgroundUrl: "/assets/projects/eva/pic4.png",
            backgroundPosition: "40% 25%",

    galleryItems: [
     
      { src: "/assets/projects/eva/eva.mp4", type: "video", poster: "/assets/projects/eva/pic1.png" },
      { src: "/assets/projects/eva/pic3.png", type: "image", alt: "Twist cutscene" },
    ],
  },
  {
    label: "#11",
    heroTitle: "Night Watcher",
    tools: "Unreal Engine 5",
    length: "1 week",
    description:
      "Comfort-game prototype: guide a glowing-tusked elephant beneath the Northern Lights, purifying orbs in a calm, atmospheric loop.",
    keyContrib: [
      "Designed soothing purification loop and rhythm.",
      "Balanced pacing via spawn & timing adjustments.",
      "Built/ lit an aurora environment for clarity & ambience.",
      "Layered ambient audio for a consistently calming mood.",
    ],
    skills: [
      "Meditative systems design",
      "Iteration for stress-free flow",
      "Lighting & atmosphere",
      "Audio ambience design",
      "Experiential design",
    ],
    backgroundUrl: "/assets/projects/night/pic1.png",
            backgroundPosition: "40% 45%",

    galleryItems: [
      
      { src: "/assets/projects/night/whisperer.mp4", type: "video", poster: "/assets/projects/night/pic1.png" },
      { src: "/assets/projects/night/pic2.png", type: "image", alt: "Purification orb" },
    ],
  },
  {
    label: "#12",
    heroTitle: "Art Exploration Game",
    tools: "Unity",
    length: "1 week",
    description:
      "Viewfinder-inspired prototype with four paths, each a different visual treatment; explores how art direction alone shifts mood.",
    keyContrib: [
      "Built 4 paths with distinct shaders/lighting.",
      "Collected feedback on mood/readability; tuned palettes.",
      "Spaced cues to balance exploration pacing.",
      "Showcased art direction as a gameplay driver.",
    ],
    skills: [
      "Visual systems (style as mechanic)",
      "Shader & lighting experimentation",
      "Iteration from player perception",
      "Environmental storytelling",
      "Design exploration",
    ],
    backgroundUrl: "/assets/projects/art/pic1.png",
            backgroundPosition: "40% 5%",

    galleryItems: [
     
      { src: "/assets/projects/art/art.mp4", type: "video", poster: "/assets/projects/art/pic1.png" },
      { src: "/assets/projects/art/pic2.png", type: "image", alt: "Path C/D overview" },
    ],
  },
  {
    label: "#13",
    heroTitle: "Red Horizon",
    tools: "Unreal Engine 4",
    length: "~2 weeks",
    description:
      "Talenthouse competition level set on Mars; focused on composition, lighting, optimisation, and readable exploration flow.",
    keyContrib: [
      "Designed environment flow to guide movement intuitively.",
      "Iterated lighting/composition for navigation & mood.",
      "Optimised meshes/textures/shaders for performance.",
      "Balanced detail density to keep focal points clear.",
    ],
    skills: [
      "Level design & composition",
      "Lighting & atmosphere",
      "Optimisation under constraints",
      "Visual clarity & readability",
      "Competition-ready polish",
    ],
    backgroundUrl: "/assets/projects/red/demo.jpg",
            backgroundPosition: "40% 25%",

    galleryItems: [
     
      { src: "/assets/projects/red/demo.mp4", type: "video", poster: "/assets/projects/red/demo.jpg" },
      { src: "/assets/projects/red/pic1.png", type: "image", alt: "Outpost lighting" },
            { src: "/assets/projects/red/pic2.png", type: "image", alt: "Outpost lighting" },

                  { src: "/assets/projects/red/pic4.png", type: "image", alt: "Outpost lighting" },

    ],
  },
  {
    label: "#14",
    heroTitle: "Serenity Stroll",
    tools: "Unity",
    length: "Short prototype",
    description:
      "A calm stroll game (guided by Thomas Brush) focusing on lighting, parallax, and environmental storytelling for mood and immersion.",
    keyContrib: [
      "Designed exploration loop to encourage slower play.",
      "Implemented parallax with tuned layer speeds.",
      "Experimented with lighting to guide focus.",
      "Applied critique to refine atmosphere & presentation.",
    ],
    skills: [
      "Environmental storytelling",
      "Parallax & depth systems",
      "Iteration with professional feedback",
      "Atmosphere & polish",
    ],
    backgroundUrl: "/assets/projects/serenity/pic1.png",
            backgroundPosition: "40% 65%",

    frosted: true,
    galleryItems: [
 
      { src: "/assets/projects/serenity/demo.mp4", type: "video", poster: "/assets/projects/serenity/pic1.png" },
      { src: "/assets/projects/serenity/pic2.png", type: "image", alt: "Stroll environment" },
    ],
  },
  {
    label: "#15",
    heroTitle: "Neon Shooter",
    tools: "Unity, C#",
    length: "~2 weeks",
    description:
      "Arcade shooter where coloured orbs alter score/time; a greyscale second level challenges recognition & reaction.",
    keyContrib: [
      "Designed scoring/timing loop and difficulty curve.",
      "Tuned spawn rates & penalties via 5 playtests.",
      "Balanced colour→greyscale transition without frustration.",
      "Implemented responsive controls & reliable hit detection.",
    ],
    skills: [
      "Systems design (score/time loop)",
      "Iteration & playtesting",
      "Progression balancing",
      "Player feedback (controls & feel)",
      "Replayability design",
    ],
    backgroundUrl: "/assets/projects/neon/pic1.png",
            backgroundPosition: "40% 65%",

    galleryItems: [

      { src: "/assets/projects/neon/demo.mp4", type: "video", poster: "/assets/projects/neon/pic1.png" },
      { src: "/assets/projects/neon/pic2.png", type: "image", alt: "Score pop" },
            { src: "/assets/projects/neon/pic3.png", type: "image", alt: "Score pop" },

    ],
  },
  {
    label: "#16",
    heroTitle: "Roller Rush",
    tools: "Unity, C#",
    length: "~3 weeks",
    description:
      "Physics-based rolling game (first complete Unity project) with AI enemies & collectibles; emphasis on responsive controls and replayability.",
    keyContrib: [
      "Designed navigate/collect/avoid loop for replayability.",
      "Balanced enemy speed & placement via 5 tests.",
      "Refined ball physics across surfaces for consistency.",
      "Placed collectibles to reward exploration & momentum.",
    ],
    skills: [
      "Core loop & difficulty tuning",
      "Enemy & spawn balancing",
      "Responsive physics feel",
      "Collectible placement for flow",
      "Unity scripting foundations",
    ],
    backgroundUrl: "/assets/projects/roller/demo.png",
            backgroundPosition: "40% 65%",

    galleryItems: [
     
      { src: "/assets/projects/roller/demo.mp4", type: "video", poster: "/assets/projects/roller/demo.png" },
      { src: "/assets/projects/roller/pic1.png", type: "image", alt: "Enemy chase" },
            { src: "/assets/projects/roller/pic2.png", type: "image", alt: "Enemy chase" },
      { src: "/assets/projects/roller/pic3.png", type: "image", alt: "Enemy chase" },

    ],
  },
];

/* ---------------------------------------------------
   Page component
-----------------------------------------------------*/
export default function Home() {
  const refScrollContainer = useRef<HTMLDivElement | null>(null);
  const locoRef = useRef<any>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-link");

async function getLocomotive() {
  const Locomotive = (await import("locomotive-scroll")).default;
  const instance = new Locomotive({
    el: refScrollContainer.current ?? new HTMLElement(),
    smooth: true,
  });
  locoRef.current = instance;
}

    function handleScroll() {
      let currentId = "";
      setIsScrolled(window.scrollY > 0);

      sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 250) {
          currentId = section.getAttribute("id") ?? "";
        }
      });

      navLinks.forEach((li) => {
        li.classList.remove("nav-active");
        if (li.getAttribute("href") === `#${currentId}`) {
          li.classList.add("nav-active");
        }
      });
    }

    void getLocomotive();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!carouselApi) return;
    setCount(carouselApi.scrollSnapList().length);
    setCurrent(carouselApi.selectedScrollSnap() + 1);
    carouselApi.on("select", () => {
      setCurrent(carouselApi.selectedScrollSnap() + 1);
    });
  }, [carouselApi]);

  useEffect(() => {
    const tilt: HTMLElement[] = Array.from(document.querySelectorAll("#tilt"));
    VanillaTilt.init(tilt, {
      speed: 300,
      glare: true,
      "max-glare": 0.1,
      gyroscope: true,
      perspective: 900,
      scale: 0.9,
    });
  }, []);

  return (
    <Container>
      <div ref={refScrollContainer} className="pt-[40px]">
        <Gradient />

        {/* Intro */}
        <section
          id="home"
          data-scroll-section
          className="mt-40 flex w-full flex-col items-center xl:mt-0 xl:min-h-screen xl:flex-row xl:justify-between"
        >
          <div className={styles.intro}>
            <div
              data-scroll
              data-scroll-direction="horizontal"
              data-scroll-speed=".09"
              className="flex flex-row items-center space-x-1.5"
            >
              <span className={styles.pill}>Game Design</span>
              <span className={styles.pill}>UI/UX</span>
              <span className={styles.pill}>Unity/Unreal Engine</span>
              <span className={styles.pill}>AI</span>
              
            </div>

            <div>
              <h1
                data-scroll
                data-scroll-enable-touch-speed
                data-scroll-speed=".06"
                data-scroll-direction="horizontal"
              >
                <span className="text-6xl tracking-tighter text-foreground 2xl:text-8xl">
                  Hello, I&apos;m
                  <br />
                </span>
                <span className="clash-grotesk text-gradient text-6xl 2xl:text-8xl">
                  Aman Chandre.
                </span>
              </h1>
              <p
                data-scroll
                data-scroll-enable-touch-speed
                data-scroll-speed=".06"
                className="mt-1 max-w-lg tracking-tight text-muted-foreground 2xl:text-xl"
              >
                Game Designer
              </p>
            </div>

            <span
              data-scroll
              data-scroll-enable-touch-speed
              data-scroll-speed=".06"
              className="flex flex-row items-center space-x-1.5 pt-6"
            >
              <Button
  type="button"
  onClick={() => {
    window.location.href = "mailto:aman.chandre@gmail.com";
  }}
>
  Get in touch <ChevronRight className="ml-1 h-4 w-4" />
</Button>

              {/* Use scrollIntoView so scroll-mt works */}
             <Button
  variant="outline"
  onClick={() => {
    if (locoRef.current?.scrollTo) {
      locoRef.current.scrollTo("#about", { offset: -80, duration: 1 });
      return;
    }
    document
      .querySelector("#about")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }}
>
  Learn more
</Button>
            </span>

           <div
              className={cn(styles.scroll, isScrolled && styles["scroll--hidden"])}
              style={{ bottom: "3rem", zIndex: 50 }}
            >
              Scroll to discover <TriangleDownIcon className="ml-1 animate-bounce" />
            </div>
          </div>

          <div
            data-scroll
            data-scroll-speed="-.01"
            id={styles["canvas-container"]}
            className="mt-10 flex w-full justify-center xl:mt-0"
          >
            <Suspense fallback={<span>Loading...</span>}>
              <Spline scene="/assets/scene.splinecode" />
            </Suspense>
          </div>
        </section>

        {/* About */}
        <section
          id="about"
          data-scroll-section
          className="scroll-mt-[40px] md:scroll-mt-[40px] lg:scroll-mt-[1060px] mb-28 md:mb-40 lg:mb-64"
           
        >
          <div className="my-20 max-w-6xl flex flex-col justify-start space-y-10">
            <h2 className="mb-6 text-3xl font-light leading-normal tracking-tighter text-foreground xl:text-[40px]">
             Game Designer with a strong technical foundation, specializing in gameplay systems, combat design, and player experience. Experienced in Unreal Engine (C++/Blueprint/GAS/Verse) and Unity (C#), with a focus on building clear, responsive mechanics and iterating through playtesting. Comfortable bridging design and engineering, inheriting complex systems, and turning ambitious concepts into polished, shippable experiences.
            </h2>

            <div className="grid grid-cols-2 gap-8 xl:grid-cols-3">
              {aboutStats.map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center text-center xl:items-start xl:text-start"
                >
                  <span className="clash-grotesk text-gradient text-4xl font-semibold tracking-tight xl:text-6xl">
                    {stat.value}
                  </span>
                  <span className="tracking-tight text-muted-foreground xl:text-lg">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
  

            {/* Skills & Tools with bottom gap to separate from Education */}
       <div className="mt-6 border-t border-white/10 pt-6 mb-16 md:mb-20 lg:mb-24">
  <h3 className="text-xl font-medium tracking-tight">
    Skills <span className="text-gradient clash-grotesk">&nbsp;&amp; Tools</span>
  </h3>

  {/* Neat + compact: consistent category cards + grid-aligned chips */}
  <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
    {SKILL_GROUPS.map((group) => (
      <div
        key={group.title}
        className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
      >
        <h4 className="text-sm md:text-base font-medium tracking-tight text-muted-foreground">
          {group.title}
        </h4>

        <div className="mt-3 grid gap-2 [grid-template-columns:repeat(auto-fit,minmax(160px,1fr))]">
          {group.items.map((skill) => (
            <StarBorder
              key={`${group.title}-${skill}`}
              as="div"
              color="#00ffeaff"
              speed="10s"
              thickness={2}
              borderColor="rgba(72, 68, 68, 0.12)"
              borderWidth={2}
              className="w-full"
            >
              <span className="block w-full text-center text-xs md:text-sm font-medium tracking-tight">
                {skill}
              </span>
            </StarBorder>
          ))}
        </div>
      </div>
    ))}
  </div>
</div>
          </div>
        </section>

        {/* Education */}
        <section
          id="education"
          data-scroll-section
          className="scroll-mt-[96px] md:scroll-mt-[112px] lg:scroll-mt-[128px] mb-20 md:mb-20 lg:mb-40"

        >
          <div className=" max-w-8xl flex flex-col mb-40">
            <h2 className="text-gradient text-4xl font-semibold tracking-tight xl:text-6xl mb-8">
              Education
            </h2>

            <div className="mt-2 grid gap-6 md:grid-cols-2">
              <SpotlightCard className="bg-[#070a12] min-h-[180px]" color="#5530bdff" intensity={0.25} radius={260}>
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <h3 className="text-lg font-medium tracking-tight">
                      Antoinette Westphal College of Media Art and Design - Drexel University
                    </h3>
                    <span className="text-sm text-muted-foreground">Philadelphia, PA</span>
                  </div>
                  <div className="text-sm text-secondary-foreground">Master of Science - Digital Media</div>
                  <div className="text-xs text-muted-foreground">2023 — 2025</div>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
                    <li>Courses: AI in Gaming, Experimental Games, Serious Games, Game Development Studies,
                      Game Development Foundation, Game Design 1, Designing for Interactivity, Interactivity
                      1 & 2, In Camera Virtual Production.</li>
                    <li>Thesis: AI Representation of Moses Williams (Graduate Thesis) Built an
                      interactive museum prototype with branching dialogue loops; tested with 5 expert
                      panelists (historians, educators, curator) and secured 95% approval, requiring only
                      minor tweaks for final acceptance.</li>
                    <li>GPA: 3.83/4</li>
                  </ul>
                </div>
              </SpotlightCard>

              <SpotlightCard className="bg-[#070a12] min-h-[180px]" color="#5530bdff" intensity={0.22} radius={260}>
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <h3 className="text-lg font-medium tracking-tight">
                      D.Y. Patil Institute of Engineering and Technology - Savitribai Phule Pune University
                    </h3>
                    <span className="text-sm text-muted-foreground">Pune, India</span>
                  </div>
                  <div className="text-sm text-secondary-foreground">Bachelor of Science - Computer Engineering</div>
                  <div className="text-xs text-muted-foreground">2017 — 2022</div>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
                    <li>Project: Built an unsupervised ML model to detect real-time anomalies in network traffic,
                      achieving 92% accuracy in identifying irregular behavior through clustering.</li>
                    <li>CGPA: 7.92/10</li>
                  </ul>
                </div>
              </SpotlightCard>
            </div>
          </div>
        </section>

        {/* Experience */}
<section
  id="experience"
  data-scroll-section
  className="scroll-mt-[10px] md:scroll-mt-[510px] lg:scroll-mt-[503px] mb-20 md:mb-20 lg:mb-40"
>
  <div className="max-w-8xl flex flex-col mb-40">
    <h2 className="text-gradient text-4xl font-semibold tracking-tight xl:text-6xl mb-8">
      Experience
    </h2>

    <div className="mt-2 grid gap-6 md:grid-cols-1">
  

     {/* Service Now */}
  <SpotlightCard
    className="bg-[#070a12] min-h-[180px]"
    color="#5530bdff"
    intensity={0.24}
    radius={260}
  >
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <h3 className="text-lg font-medium tracking-tight">ServiceNow</h3>
        <span className="text-sm text-muted-foreground">US (Remote)</span>
      </div>

      <div className="text-sm text-secondary-foreground">
        Game Developer
      </div>
      <div className="text-xs text-muted-foreground">January 2025 — Present</div>

      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
        <li>
          Build player controllers, character movement, interaction systems, state machines, and reusable gameplay mechanics using the Unreal Gameplay Framework.
        </li>
        <li>
          Develop Game AI using Behavior Trees and pathfinding to create dynamic NPC behaviors and reduce dependence on scripted interactions. 
        </li>
        <li>
         Implement multiplayer gameplay using client-server architecture and network synchronization for real-time interactive experiences.
        </li>
        <li>
         Profile and optimize rendering and gameplay performance using Unreal Insights, CPU/GPU profiling, materials, shaders, asset optimization, object pooling, and memory management.
        </li>
        <li>
         Integrate conversational AI agents and AI SDKs into interactive gameplay experiences.
        </li>
      </ul>
    </div>
  </SpotlightCard>

      {/* MindTree */}
  <SpotlightCard
    className="bg-[#070a12] min-h-[180px]"
    color="#5530bdff"
    intensity={0.24}
    radius={260}
  >
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <h3 className="text-lg font-medium tracking-tight">Mindtree</h3>
        <span className="text-sm text-muted-foreground">India</span>
      </div>

      <div className="text-sm text-secondary-foreground">
        Game Developer
      </div>
      <div className="text-xs text-muted-foreground">January 2021 — August 2023</div>

      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
        <li>
          Built player controllers, combat, interaction, inventory, progression, and reusable gameplay systems.
        </li>
        <li>
          Developed modular game architecture using C#, object-oriented programming, prefabs, components, scene management, and reusable game loops. 
        </li>
        <li>
         Created responsive HUDs, menu systems, Animator Controller workflows, and other UI systems.
        </li>
        <li>
         Implemented gameplay behaviors using state machines, physics, collision systems, raycasting, AI behaviors, and NavMesh.
        </li>
        <li>
         Profiled and optimized applications using Unity Profiler, Frame Debugger, object pooling, draw-call optimization, and memory-management techniques.
        </li>
        <li>
         Delivered cross-platform builds for Android and iOS and developed AR experiences using AR Foundation, ARCore, and Vuforia.
        </li>
      </ul>
    </div>
  </SpotlightCard>

     {/* The NetVR
  <SpotlightCard
    className="bg-[#070a12] min-h-[180px]"
    color="#5530bdff"
    intensity={0.24}
    radius={260}
  >
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <h3 className="text-lg font-medium tracking-tight">The NetVR</h3>
        <span className="text-sm text-muted-foreground">Texas, US (Remote)</span>
      </div>

      <div className="text-sm text-secondary-foreground">
        Unity Developer
      </div>
      <div className="text-xs text-muted-foreground">March 2026 — Present</div>

      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
        <li>
          Designing and refining product screens in Figma and implementing polished UI improvements in Unity 

        </li>
        <li>
          Enhancing the existing UI/UX to create a cleaner, sleeker, and sharper user experience 
        </li>
        <li>
         Improving visual hierarchy, spacing, consistency, and usability across the product
        </li>
      </ul>
    </div>
  </SpotlightCard> */}


  {/* Cubilete Cup
  <SpotlightCard
    className="bg-[#070a12] min-h-[180px]"
    color="#5530bdff"
    intensity={0.24}
    radius={260}
  >
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <h3 className="text-lg font-medium tracking-tight">Cubilete Cup</h3>
        <span className="text-sm text-muted-foreground">Nevada, US (Remote)</span>
      </div>

      <div className="text-sm text-secondary-foreground">
        Game Developer
      </div>
      <div className="text-xs text-muted-foreground">November 2025 — Present</div>

      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
        <li>
          Owned the design and implementation of interactive gameplay UI systems in
          Unity (C#), improving responsiveness and player feedback in a multiplayer
          mobile game.
        </li>
        <li>
          Designed and implemented menu flows and interactive UI components to improve
          clarity, pacing, and player engagement.
        </li>
        <li>
          Built animated UI feedback and gameplay-supporting visuals that increased
          perceived polish and moment-to-moment responsiveness.
        </li>
        <li>
          Debugged gameplay and UI interaction logic, resolving stability and navigation
          issues across networked builds.
        </li>
        <li>
          Participated in regular playtests, documenting findings and iterating on UI
          layouts/interactions with developers to fix usability issues.
        </li>
      </ul>
    </div>
  </SpotlightCard> */}

 {/* Storystack*/}
  {/* <SpotlightCard
    className="bg-[#070a12] min-h-[180px]"
    color="#5530bdff"
    intensity={0.24}
    radius={260}
  >
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <h3 className="text-lg font-medium tracking-tight">StoryStack Inc.</h3>
        <span className="text-sm text-muted-foreground">Ontario, CA (Remote)</span>
      </div>

      <div className="text-sm text-secondary-foreground">UI Designer</div>
      <div className="text-xs text-muted-foreground">March 2026</div>

      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
        <li>
         Contributed to a short exploratory design sprint for a children’s storytelling platform focused on ages 8–12.
        </li>
        <li>
         Explored motion driven UI concepts (micro-animations, feedback loops, and interactive states) to enhance immersion and retention
        </li>
        <li>
          Built a working React prototype to visualize real-time interactions and bridge design development implementation
        </li>
        <li>
          Contributed to early-stage visual direction through iterative exploration
        </li>
      
      </ul>
    </div>
  </SpotlightCard> */}

  {/* Diaspora Games */}
  {/* <SpotlightCard
    className="bg-[#070a12] min-h-[180px]"
    color="#5530bdff"
    intensity={0.24}
    radius={260}
  >
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <h3 className="text-lg font-medium tracking-tight">Diaspora Games</h3>
        <span className="text-sm text-muted-foreground">California, US (Remote)</span>
      </div>

      <div className="text-sm text-secondary-foreground">Game Developer Intern</div>
      <div className="text-xs text-muted-foreground">May 2025 — July 2025</div>

      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
        <li>
          Implemented and iterated on third-person combat gameplay features using Unreal
          Engine Gameplay Ability System (GAS), balancing responsiveness, readability,
          and designer intent.
        </li>
        <li>
          Implemented GAS-driven combat with cooldowns, status tags, and stacking effects,
          maintaining time-to-kill (TTK) stability within ±10% across playtests.
        </li>
        <li>
          Designed and tuned a card-based combat loop (draw / play / resolve) with an
          energy economy using Blueprint and C++.
        </li>
        <li>
          Investigated and fixed gameplay bugs identified during playtests, collaborating
          with QA and designers to refine balance and feel.
        </li>
        <li>
          Replaced hard-coded values with Data Tables and Curves, reducing iteration time
          by ~30% and eliminating duplicate-effect bugs.
        </li>
      </ul>
    </div>
  </SpotlightCard> */}

  {/* Augmentastic */}
  {/* <SpotlightCard
    className="bg-[#070a12] min-h-[180px]"
    color="#5530bdff"
    intensity={0.24}
    radius={260}
  >
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-baseline gap-x-2">
        <h3 className="text-lg font-medium tracking-tight">Augmentastic Pvt. Ltd.</h3>
        <span className="text-sm text-muted-foreground">Pune, India</span>
      </div>

      <div className="text-sm text-secondary-foreground">Unity 3D Developer</div>
      <div className="text-xs text-muted-foreground">December 2022 — July 2023</div>

      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-300">
        <li>
          Reworked UI/UX, puzzle systems, and interactive mechanics to make a serious game
          clearer, more engaging, and easier to progress through.
        </li>
        <li>
          Collaborated with artists and developers to convert in-progress ideas into fully
          playable features that later informed the Steam release{" "}
          <span className="font-medium">CodeStrike</span>.
        </li>
        <li>
          Recognized internally for delivering professional-level design and implementation
          improvements that elevated overall product quality.
        </li>
      </ul>
    </div>
  </SpotlightCard> */}
</div>
  </div>
</section>


        {/* Projects — header + #1 */}
        <section
          id="projects"
          data-scroll-section
          className="scroll-mt-[200px] md:scroll-mt-[240px] lg:scroll-mt-[850px] py-16 md:py-20"
        >
          <h2 className="text-gradient text-4xl font-semibold tracking-tight xl:text-6xl mb-8 leading-[1.15] pb-1 inline-block">
            Projects
          </h2>

          <div
            className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen
                       px-4 sm:px-6 md:px-10 lg:px-20
                       mt-8 md:mt-10 lg:mt-12"
          >
            <MagicBento
              cards={mosesCards}
              textAutoHide={false}
              enableStars
              enableSpotlight
              enableBorderGlow
              enableMagnetism
              enableTilt={false}
              clickEffect
              spotlightRadius={300}
              particleCount={12}
              glowColor="132, 0, 255"
            />
          </div>
        </section>

        {/* Project #2 */}
        <section
          id="projects-pygon"
          data-scroll-section
          className="scroll-mt-40 md:scroll-mt-44 lg:scroll-mt-48 py-16 md:py-20"
        >
          <h2 className="sr-only">The Legend of Pygon</h2>
          <div
            className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen
                       px-4 sm:px-6 md:px-10 lg:px-20
                       mt-8 md:mt-10 lg:mt-12"
          >
            <MagicBento
              cards={pygonCards}
              textAutoHide={false}
              enableStars
              enableSpotlight
              enableBorderGlow
              enableMagnetism
              enableTilt={false}
              clickEffect
              spotlightRadius={300}
              particleCount={12}
              glowColor="132, 0, 255"
            />
          </div>
        </section>

        {/* Projects #3 — #16 generated */}
        {OTHER_PROJECTS.map((p) => (
          <section
            key={p.label}
            id={`projects-${parseInt(p.label.replace("#", ""), 10)}`}
            data-scroll-section
            className="scroll-mt-40 md:scroll-mt-44 lg:scroll-mt-48 py-16 md:py-20"
          >
            <h2 className="sr-only">{p.heroTitle}</h2>
            <div
              className="relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen
                         px-4 sm:px-6 md:px-10 lg:px-20
                         mt-8 md:mt-10 lg:mt-12"
            >
              <MagicBento
                cards={makeCards(p)}
                textAutoHide={false}
                enableStars
                enableSpotlight
                enableBorderGlow
                enableMagnetism
                enableTilt={false}
                clickEffect
                spotlightRadius={300}
                particleCount={12}
                glowColor="132, 0, 255"
              />
            </div>
          </section>
        ))}

        {/* Contact → Profile Card */}
        <section id="contact" className="mt-40 mb-2">
          <div className="mx-auto max-w-6xl">
            <div className="flex justify-center">
              <ProfileCard
                className="mx-auto"
                name="Aman Chandre"
                title="Game Designer"
                handle="amanchandre_"
                avatarUrl="/assets/pp.jpeg"
              />
            </div>
            <div className="mt-6 flex justify-center">
              <GradientText
                as="h2"
                className="clash-grotesk text-center text-4xl md:text-7x1 font tracking-thin"
                colors={["#00ff73ff", "#6FB6FF", "#79F2C7"]}
                animationSpeed={3}
              >
                Let&apos;s Work Together
              </GradientText>
            </div>
          </div>
        </section>
      </div>
    </Container>
  );
}

function Gradient() {
  return (
    <>
      {/* Upper gradient */}
      <div className="absolute -top-40 right-0 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
        <svg
          className="relative left-[calc(50%-11rem)] -z-10 h-[21.1875rem] max-w-none -translate-x-1/2 rotate-[30deg] sm:left-[calc(50%-30rem)] sm:h-[42.375rem]"
          viewBox="0 0 1155 678"
        >
          <path
            fill="url(#45de2b6b-92d5-4d68-a6a0-9b9b2abad533)"
            fillOpacity=".1"
            d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
          />
          <defs>
            <linearGradient
              id="45de2b6b-92d5-4d68-a6a0-9b9b2abad533"
              x1="1155.49"
              x2="-78.208"
              y1=".177"
              y2="474.645"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#7980fe" />
              <stop offset={1} stopColor="#f0fff7" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Lower gradient */}
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <svg
          className="relative left-[calc(50%+3rem)] h-[21.1875rem] max-w-none -translate-x-1/2 sm:left-[calc(50%+36rem)] sm:h-[42.375rem]"
          viewBox="0 0 1155 678"
        >
          <path
            fill="url(#ecb5b0c9-546c-4772-8c71-4d3f06d544bc)"
            fillOpacity=".1"
            d="M317.219 518.975L203.852 678 0 438.341l317.219 80.634 204.172-286.402c1.307 132.337 45.083 346.658 209.733 145.248C936.936 126.058 882.053-94.234 1031.02 41.331c119.18 108.451 130.68 295.337 121.53 375.223L855 299l21.173 362.054-558.954-142.079z"
          />
          <defs>
            <linearGradient
              id="ecb5b0c9-546c-4772-8c71-4d3f06d544bc"
              x1="1155.49"
              x2="-78.208"
              y1=".177"
              y2="474.645"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#9A70FF" />
              <stop offset={1} stopColor="#838aff" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </>
  );
}
