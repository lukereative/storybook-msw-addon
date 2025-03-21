import type { RequestHandler } from "msw";
import type { SetupWorker, StartOptions } from "msw/browser";
import { setupWorker } from "msw/browser";
import { isNodeProcess } from "is-node-process";

export type MswParameters = {
  msw?: {
    handlers: RequestHandler[];
    originalResponses: Record<string, any>;
  };
};

type Context = {
  parameters: MswParameters;
  viewMode: string;
};

let worker: SetupWorker;
let opt: StartOptions;
let initialHandlers: RequestHandler[] = [];
window.__MSW_STORYBOOK__ = window.__MSW_STORYBOOK__ || {};
window.__MSW_STORYBOOK__.preserveHandlers = false; // Flag to control whether handlers should be preserved

export const initialize = async (
  options?: StartOptions,
  handlers: RequestHandler[] = [],
) => {
  opt = options;
  initialHandlers = handlers;
};

const setupHandlers = (msw: MswParameters["msw"]) => {
  if (!worker) {
    return;
  }
  worker.resetHandlers(...initialHandlers);
  if (msw) {
    const handlers = Array.isArray(msw) ? msw : msw.handlers;
    if (handlers && handlers.length > 0) {
      worker.use(...handlers);
    }
  }
};

export const mswLoader = async (context: Context) => {
  const {
    parameters: { msw },
    viewMode,
  } = context;

  if (!msw || isNodeProcess()) {
    return;
  }

  try {
    if (window.__MSW_STORYBOOK__?.worker) {
      worker = window.__MSW_STORYBOOK__.worker;
    } else {
      worker = setupWorker();
      await worker.start(opt);
    }

    if (!window.__MSW_STORYBOOK__.preserveHandlers) {
      setupHandlers(msw);
    }

    window.__MSW_STORYBOOK__.worker = worker;
    window.__MSW_STORYBOOK__.preserveHandlers = false;
  } catch (error) {
    console.error("Failed to start MSW worker:", error);
  }

  return {};
};
