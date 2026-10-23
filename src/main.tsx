import { StrictMode, useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Maximize2,
  Minus,
  Plus,
  RotateCcw,
  X,
} from "lucide-react";
import { cases, projects } from "./content";
import type { Block, Case } from "./content";
import type { CSSProperties, HTMLAttributes } from "react";
import { imageGeometry } from "./images";
import { activeSection, sectionStops } from "./navigation";
import "./styles.css";

type Picture = { src: string; alt: string };
const asset = (name: string) => `/assets/${name}`;
function ProjectArrow() {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path
        d="M4 36L36 4M8 4H29M36 11V32"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="square"
      />
    </svg>
  );
}
function ProjectCover({ name }: { name: string }) {
  const src = asset(`cover-${name}.webp`);
  const g = imageGeometry(src);
  return (
    <svg
      className="project-cover"
      viewBox={`${g.left} ${g.top} ${g.visibleWidth} ${g.visibleHeight}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <image href={src} width={g.width} height={g.height} />
    </svg>
  );
}
function SocialLinks() {
  return (
    <nav className="socials" aria-label="Контакты">
      <a
        href="http://www.linkedin.com/in/rinat-musin-87378240b"
        target="_blank"
        rel="noopener noreferrer"
      >
        LinkedIn
      </a>
      <span aria-disabled="true" title="Резюме скоро появится">
        CV
      </span>
      <a href="https://t.me/a1pha9" target="_blank" rel="noopener noreferrer">
        Telegram
      </a>
      <a href="mailto:rinat.musin099@gmail.com">Email</a>
    </nav>
  );
}
function Home() {
  return (
    <main id="main" className="home">
      <div className="home-title">
        <h1>Мусин Ринат</h1>
        <p>Product designer</p>
      </div>
      <aside className="home-location">
        <span>Vietnam</span>
        <span>GMT +7</span>
        <span>Remote</span>
        <span>Open to work</span>
      </aside>
      <div className="home-statement">
        <p>
          Проектирую сложные B2B и Enterprise-продукты. Люблю разбираться в{" "}
          <strong>бизнес-логике</strong> и{" "}
          <strong>доводить решения до деталей.</strong>
        </p>
      </div>
      <div className="home-socials">
        <SocialLinks />
      </div>
      <div className="home-year">2026</div>
      <Link className="home-projects" to="/projects">
        Проекты <ArrowRight aria-hidden="true" />
      </Link>
    </main>
  );
}
function Projects() {
  return (
    <main id="main" className="page projects-page">
      <Link className="back" to="/">
        <ArrowLeft size={20} />
        На главную
      </Link>
      <h1 className="sr-only">Проекты</h1>
      <div className="project-grid">
        {Object.entries(projects).map(([key, project]) => (
          <Link
            className={`project-card project-card-${key}`}
            key={key}
            to={`/projects/${key}`}
          >
            <div className="project-card-heading">
              <h2>
                {key === "bank" ? (
                  <>
                    Система управления
                    <br />
                    кассовым процессингом
                  </>
                ) : (
                  <>
                    Центр управления
                    <br />
                    результативностью
                  </>
                )}
              </h2>
              <ProjectArrow />
            </div>
            <div className="project-art">
              <ProjectCover name={key} />
            </div>
            <span className="project-count">
              {project.count} {project.count === 1 ? "кейс" : "кейса"}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
function Project({ openImage }: { openImage: (picture: Picture) => void }) {
  const { projectId, caseId } = useParams();
  const key = projectId as keyof typeof projects;
  const project = projects[key];
  const study = cases[`${key}/${caseId}`];
  if (!project || (caseId && !study)) return <NotFound />;
  return (
    <main id="main" className="page">
      <header className="project-header">
        <Link className="back" to="/projects">
          <ArrowLeft size={20} />
          Назад
        </Link>
        <h1>{project.title}</h1>
        <nav className="tabs" aria-label="Страницы проекта">
          <NavLink end to={`/projects/${key}`}>
            О проекте
          </NavLink>
          {Array.from({ length: project.count }, (_, i) => (
            <NavLink key={i} to={`/projects/${key}/case/${i + 1}`}>
              Кейс {i + 1}
            </NavLink>
          ))}
        </nav>
      </header>
      {study ? (
        <CaseStudy
          key={`${key}/${caseId}`}
          study={study}
          caseKey={`${key}/${caseId}`}
          openImage={openImage}
        />
      ) : (
        <article className="about">
          {[
            ["Продукт", project.product],
            ["Контекст", project.context],
            ["Пользователи", project.users],
            ["NDA", project.nda],
          ].map(([title, text]) => (
            <section key={title} className={title === "NDA" ? "nda" : ""}>
              <h2>{title}</h2>
              <p>{text}</p>
            </section>
          ))}
        </article>
      )}
    </main>
  );
}
function CaseStudy({
  study,
  caseKey,
  openImage,
}: {
  study: Case;
  caseKey: string;
  openImage: (picture: Picture) => void;
}) {
  const [active, setActive] = useState(study.sections[0].id);
  const getStops = useCallback(() => {
    const sections = study.sections.map((section) => {
      const element = document.getElementById(section.id)!;
      const rect = element.getBoundingClientRect();
      return {
        id: section.id,
        top: rect.top + window.scrollY,
        height: rect.height,
      };
    });
    return sectionStops(
      sections,
      Math.max(0, document.documentElement.scrollHeight - window.innerHeight),
      window.innerWidth <= 900 ? 24 : 48,
    );
  }, [study]);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      setActive(
        activeSection(getStops(), window.scrollY) ?? study.sections[0].id,
      );
      frame = 0;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, [study, getStops]);
  const ordered = ["bank/1", "bank/2", "bi/1"];
  const index = ordered.indexOf(caseKey);
  const caseUrl = (id: string) => `/projects/${id.replace("/", "/case/")}`;
  return (
    <>
      <div className={`case-intro ${study.terms ? "with-terms" : ""}`}>
        <section>
          <h2>Контекст</h2>
          <p>{study.context}</p>
        </section>
        <section>
          <h2>Задача</h2>
          <p>{study.task}</p>
        </section>
        {study.terms && (
          <section>
            <h2>Термины</h2>
            {study.terms.map((term) => (
              <p key={term}>{term}</p>
            ))}
          </section>
        )}
      </div>
      <div className="case-layout">
        <aside className="toc">
          <span className="toc-label">Навигация</span>
          <nav aria-label="Разделы кейса">
            {study.sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                aria-current={active === section.id ? "location" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  history.replaceState(history.state, "", `#${section.id}`);
                  window.scrollTo({
                    top:
                      getStops().find((stop) => stop.id === section.id)?.top ??
                      0,
                    behavior: window.matchMedia(
                      "(prefers-reduced-motion: reduce)",
                    ).matches
                      ? "instant"
                      : "smooth",
                  });
                }}
              >
                {section.title}
              </a>
            ))}
          </nav>
        </aside>
        <article className="case-article">
          {study.sections.map((section) => (
            <section id={section.id} className="case-section" key={section.id}>
              <h2>{section.title}</h2>
              <div className="section-blocks">
                {section.blocks.map((block, i) => (
                  <ContentBlock key={i} block={block} openImage={openImage} />
                ))}
              </div>
            </section>
          ))}
        </article>
      </div>
      <footer className={`case-footer${index > 0 ? " has-previous" : ""}`}>
        {index > 0 && (
          <Link className="case-previous" to={caseUrl(ordered[index - 1])}>
            <ArrowLeft size={24} />
            Предыдущий кейс
          </Link>
        )}
        <SocialLinks />
        {index < ordered.length - 1 && (
          <Link className="case-next" to={caseUrl(ordered[index + 1])}>
            Следующий кейс
            <ArrowRight size={24} />
          </Link>
        )}
      </footer>
    </>
  );
}
function ContentBlock({
  block,
  openImage,
}: {
  block: Block;
  openImage: (picture: Picture) => void;
}) {
  if (block.image) {
    return (
      <figure className="case-figure">
        <button
          className="image-button"
          onClick={() =>
            openImage({ src: asset(block.image!), alt: block.alt! })
          }
          aria-label={`Увеличить: ${block.alt}`}
        >
          <PictureSurface
            picture={{ src: asset(block.image), alt: block.alt! }}
            lazy
          />
          <span className="image-expand">
            <Maximize2 size={18} />
          </span>
        </button>
      </figure>
    );
  }
  return (
    <div className="text-block">
      {block.heading && <h3>{block.heading}</h3>}
      {block.text && <p>{block.text}</p>}
      {block.list && (
        <ul>
          {block.list.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ul>
      )}
      {block.numbered && (
        <ol className="numbered">
          {block.numbered.map((text) => (
            <li key={text}>
              <p>{text}</p>
            </li>
          ))}
        </ol>
      )}
      {block.compare && (
        <div className="comparison">
          {block.compare.map((items, i) => (
            <div key={i}>
              <h3>{i ? "Что требовалось" : "Как было"}</h3>
              <ul>
                {items.map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function PictureSurface({
  picture,
  lazy = false,
  style,
  ...props
}: { picture: Picture; lazy?: boolean } & HTMLAttributes<HTMLSpanElement>) {
  const g = imageGeometry(picture.src);
  return (
    <span
      {...props}
      className={`picture-surface${g.outlined ? " picture-outlined" : ""}${g.cover ? " picture-cover" : ""}`}
      style={
        {
          "--image-ratio": g.visibleWidth / g.visibleHeight,
          aspectRatio: `${g.visibleWidth} / ${g.visibleHeight}`,
          ...style,
        } as CSSProperties
      }
    >
      <img
        src={picture.src}
        alt={picture.alt}
        draggable={false}
        width={g.width}
        height={g.height}
        loading={lazy ? "lazy" : undefined}
        decoding="async"
        style={{
          width: `${(100 * g.width) / g.visibleWidth}%`,
          height: `${(100 * g.height) / g.visibleHeight}%`,
          left: `${(-100 * g.left) / g.visibleWidth}%`,
          top: `${(-100 * g.top) / g.visibleHeight}%`,
        }}
      />
    </span>
  );
}
function Lightbox({
  picture,
  onClose,
}: {
  picture: Picture;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ x: 0, y: 0, px: 0, py: 0, distance: 0, scale: 1 });
  const zoom = useCallback((value: number) => {
    const next = Math.max(1, Math.min(5, value));
    setScale(next);
    if (next === 1) setPosition({ x: 0, y: 0 });
  }, []);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.current?.showModal();
    return () => {
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  useEffect(() => {
    const node = stage.current;
    const wheel = (event: WheelEvent) => {
      event.preventDefault();
      setScale((current) => {
        const next = Math.max(1, Math.min(5, current - event.deltaY * 0.003));
        if (next === 1) setPosition({ x: 0, y: 0 });
        return next;
      });
    };
    node?.addEventListener("wheel", wheel, { passive: false });
    return () => node?.removeEventListener("wheel", wheel);
  }, []);
  const start = (event: ReactPointerEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    const points = [...pointers.current.values()];
    gesture.current = {
      x: event.clientX,
      y: event.clientY,
      px: position.x,
      py: position.y,
      distance:
        points.length === 2
          ? Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)
          : 0,
      scale,
    };
  };
  const move = (event: ReactPointerEvent<HTMLSpanElement>) => {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    const points = [...pointers.current.values()];
    if (points.length === 2 && gesture.current.distance) {
      zoom(
        (gesture.current.scale *
          Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y)) /
          gesture.current.distance,
      );
    } else if (scale > 1)
      setPosition({
        x: gesture.current.px + event.clientX - gesture.current.x,
        y: gesture.current.py + event.clientY - gesture.current.y,
      });
  };
  const end = (event: ReactPointerEvent<HTMLSpanElement>) => {
    pointers.current.delete(event.pointerId);
    const point = [...pointers.current.values()][0];
    if (point)
      gesture.current = {
        x: point.x,
        y: point.y,
        px: position.x,
        py: position.y,
        distance: 0,
        scale,
      };
  };
  return (
    <dialog
      ref={dialog}
      className="lightbox"
      aria-label="Просмотр изображения"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "+" || event.key === "=") zoom(scale + 0.25);
        if (event.key === "-") zoom(scale - 0.25);
        if (event.key === "0") zoom(1);
      }}
    >
      <div className="lightbox-toolbar">
        <span className="lightbox-caption">{picture.alt}</span>
        <div className="zoom-controls">
          <button
            aria-label="Уменьшить"
            disabled={scale <= 1}
            onClick={() => zoom(scale - 0.25)}
          >
            <Minus />
          </button>
          <output aria-live="polite">{Math.round(scale * 100)}%</output>
          <button
            aria-label="Увеличить"
            disabled={scale >= 5}
            onClick={() => zoom(scale + 0.25)}
          >
            <Plus />
          </button>
          <button
            aria-label="Сбросить масштаб"
            onClick={() => {
              zoom(1);
              setPosition({ x: 0, y: 0 });
            }}
          >
            <RotateCcw />
          </button>
          <button
            className="close-lightbox"
            aria-label="Закрыть изображение"
            onClick={onClose}
          >
            <X />
          </button>
        </div>
      </div>
      <div
        ref={stage}
        className="lightbox-stage"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <PictureSurface
          picture={picture}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            cursor: scale > 1 ? "grab" : "zoom-in",
            borderRadius: 8 / scale,
          }}
          onDoubleClick={() => zoom(scale === 1 ? 2 : 1)}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={end}
          onPointerCancel={end}
        />
      </div>
      <p className="lightbox-hint">
        Колесо мыши или + / − — масштаб · Перетаскивание — перемещение · Esc —
        закрыть
      </p>
    </dialog>
  );
}
function NotFound() {
  return (
    <main id="main" className="page not-found">
      <p>404</p>
      <h1>Страница не найдена</h1>
      <Link className="back" to="/">
        <ArrowLeft />
        На главную
      </Link>
    </main>
  );
}
function App() {
  const [picture, setPicture] = useState<Picture | null>(null);
  const { pathname } = useLocation();
  useEffect(() => {
    setPicture(null);
    const hash = decodeURIComponent(window.location.hash.slice(1));
    if (hash)
      requestAnimationFrame(() =>
        document.getElementById(hash)?.scrollIntoView(),
      );
    else window.scrollTo({ top: 0, behavior: "instant" });
    const parts = pathname.split("/");
    const project = projects[parts[2] as keyof typeof projects];
    document.title = project
      ? `${parts[3] ? `Кейс ${parts[4]} · ` : ""}${project.title} — Мусин Ринат`
      : pathname === "/projects"
        ? "Проекты — Мусин Ринат"
        : "Мусин Ринат — Product designer";
  }, [pathname]);
  return (
    <>
      <a className="skip-link" href="#main">
        К содержимому
      </a>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route
          path="/projects/:projectId"
          element={<Project openImage={setPicture} />}
        />
        <Route
          path="/projects/:projectId/case/:caseId"
          element={<Project openImage={setPicture} />}
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {picture && (
        <Lightbox picture={picture} onClose={() => setPicture(null)} />
      )}
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
