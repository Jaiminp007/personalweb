// Use the portfolio's installed résumé when Orbit is served under /game/.
// Standalone Orbit still points to the public portfolio.
const resumeUrl = window.location.pathname.startsWith("/game/")
  ? "/resume.pdf"
  : "https://www.jaimin-patel.me/resume.pdf";

export const worlds = [
  {
    id: "about",
    number: "01",
    name: "Origin",
    category: "THE PERSON",
    subtitle: "A little about the pilot.",
    color: "#8cc7c3",
    position: [-105, 8, -100],
    radius: 19,
    type: "earth",
    title: "Curiosity is the starting point.",
    description:
      "I’m Jaimin Patel, a Computing and Financial Management student at the University of Waterloo and the founder of Polarline Markets. I build AI-native tools for investment research and fund operations.",
    details: [
      [
        "THE INTERSECTION",
        "Computing × finance",
        "I’m interested in turning research and software into tools people can actually use.",
      ],
      [
        "CURRENT TRAJECTORY",
        "Building systems that hold up",
        "My work spans investment research, systematic trading, agent tooling, and reproducible experiments.",
      ],
      [
        "PREVIOUS ORBIT",
        "HyperOdd",
        "Previously, I worked on prediction market infrastructure at HyperOdd.",
      ],
    ],
    links: [
      ["More about me", "https://www.jaimin-patel.me/about"],
      ["View résumé", resumeUrl],
    ],
  },
  {
    id: "projects",
    number: "02",
    name: "Workshop",
    category: "SELECTED WORK",
    subtitle: "Ideas, built into systems.",
    color: "#d6ad83",
    position: [95, -6, -170],
    radius: 24,
    type: "gas",
    title: "Some ideas deserve an orbit.",
    description:
      "A selection of what I’m building, researching, and contributing to. Follow a project to the full story on my portfolio.",
    details: [
      [
        "01 / POLARLINE MARKETS",
        "Scout",
        "AI-native Front Office and Back Office workflows for investment research, strategy development, backtesting, and reconciliation.",
        "https://www.jaimin-patel.me/projects/polarline-markets",
      ],
      [
        "02 / FINNY",
        "Try to disprove it.",
        "An AI financial harness for systematic trading that researches ideas, writes strategies, and works toward evidence-bound verdicts.",
        "https://www.jaimin-patel.me/projects/finny",
      ],
      [
        "03 / RESEARCH & OPEN SOURCE",
        "Open systems",
        "Reproducible artificial-life experiments and open-source agent tooling across Fly Ecosystem, Hermes Agent, and OpenCode-based work.",
        "https://www.jaimin-patel.me/projects/research-open-source",
      ],
    ],
    links: [
      ["All projects", "https://www.jaimin-patel.me/projects"],
      ["GitHub", "https://github.com/Jaiminp007"],
    ],
  },
  {
    id: "contact",
    number: "03",
    name: "Relay",
    category: "MAKE CONTACT",
    subtitle: "Good things start with a hello.",
    color: "#9eabdf",
    position: [-5, 30, -340],
    radius: 17,
    type: "ice",
    title: "A signal worth sending.",
    description:
      "Have an interesting project, a question, or an idea to trade? I’m open to conversations about software, AI, finance, and the things in between.",
    details: [
      [
        "LET’S TALK",
        "Book a conversation",
        "Find a time that works for a chat.",
        "https://cal.com/jaimin-patel-e3fsrw",
      ],
      [
        "STAY CONNECTED",
        "LinkedIn",
        "Connect with me and follow what I’m working on.",
        "https://www.linkedin.com/in/jaimin-patel007",
      ],
      [
        "BUILD IN THE OPEN",
        "GitHub",
        "Explore my repositories and contributions.",
        "https://github.com/Jaiminp007",
      ],
    ],
    links: [
      ["Book a chat", "https://cal.com/jaimin-patel-e3fsrw"],
      ["Main portfolio", "https://www.jaimin-patel.me/"],
    ],
  },
];
export function dossierMarkup(world) {
  return `<div class="eyebrow" style="color:${world.color}">${world.number} / ${world.category}</div><div class="dossier-world" style="--world-color:${world.color}"></div><div class="dossier-name">${world.name}</div><h2>${world.title}</h2><p class="dossier-description">${world.description}</p><div class="dossier-cards">${world.details.map(([label, title, body, url]) => `<${url ? "a" : "section"} ${url ? `href="${url}" target="_blank" rel="noopener noreferrer"` : ""} class="detail-card"><span class="eyebrow">${label}</span><h3>${title}${url ? " ↗" : ""}</h3><p>${body}</p></${url ? "a" : "section"}>`).join("")}</div><div class="dossier-links">${world.links.map(([label, url]) => `<a class="primary" href="${url}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`).join("")}</div>`;
}
