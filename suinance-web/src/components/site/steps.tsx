"use client";

import { motion, useScroll, useSpring } from "motion/react";
import { useRef } from "react";
import { Reveal } from "@/components/ui/motion";

export function Steps({ steps }: { steps: { title: string; body: string }[] }) {
  const ref = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const scale = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  return (
    <ol ref={ref} className="relative grid gap-10 pl-14 md:grid-cols-4 md:gap-6 md:pl-0 md:pt-16">
      <div aria-hidden className="absolute bottom-2 left-[19px] top-2 w-[2px] bg-line md:bottom-auto md:left-0 md:right-0 md:top-[19px] md:h-[2px] md:w-auto" />
      <motion.div
        aria-hidden
        className="absolute bottom-2 left-[19px] top-2 w-[2px] origin-top bg-ink md:hidden"
        style={{ scaleY: scale }}
      />
      <motion.div
        aria-hidden
        className="absolute left-0 right-0 top-[19px] hidden h-[2px] origin-left bg-ink md:block"
        style={{ scaleX: scale }}
      />
      {steps.map((s, i) => (
        <Reveal as="li" key={s.title} delay={i * 0.08} className="relative grid content-start gap-3">
          <span className="absolute -left-14 top-0 grid h-10 w-10 place-items-center rounded-full border-[1.5px] border-ink bg-yellow font-mono text-sm font-medium md:-top-16 md:left-0">
            0{i + 1}
          </span>
          <h3 className="text-xl font-bold">{s.title}</h3>
          <p className="text-[15px] text-muted">{s.body}</p>
        </Reveal>
      ))}
    </ol>
  );
}
