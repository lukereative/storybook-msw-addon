import { DefaultBodyType, HttpResponse, RequestHandler } from "msw";
import { executeHandlers } from "./executeHandlers";
import { randomId } from "./randomId";

export const getResponse = async (
  handlers: Array<RequestHandler>,
  request: Request,
): Promise<
  | {
      handler: RequestHandler | undefined;
      response: HttpResponse<DefaultBodyType>;
    }
  | undefined
> => {
  const result = await executeHandlers({
    request,
    requestId: randomId(),
    handlers,
  });

  return {
    handler: result?.handler,
    response: result?.response as HttpResponse<DefaultBodyType>,
  };
};
