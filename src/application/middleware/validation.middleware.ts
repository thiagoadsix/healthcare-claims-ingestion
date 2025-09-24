import { Request, Response, NextFunction, RequestHandler } from 'express';
import { z, ZodType } from 'zod';

type ValidationSchemas = {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
};

const buildError = (issues: z.core.$ZodIssue[]) => ({
  error: 'Validation Error',
  message: 'Invalid input data',
  details: issues.map(i => ({
    field: i.path.join('.'),
    message: i.message,
  })),
});

export const validate = (schemas: ValidationSchemas): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    const issues: z.core.$ZodIssue[] = [];

    if (schemas.body) {
      const r = schemas.body.safeParse(req.body);
      if (!r.success) issues.push(...r.error.issues);
      else req.body = r.data as unknown as Request['body'];
    }

    if (schemas.query) {
      const r = schemas.query.safeParse(req.query);
      if (!r.success) issues.push(...r.error.issues);
    }

    if (schemas.params) {
      const r = schemas.params.safeParse(req.params);
      if (!r.success) issues.push(...r.error.issues);
    }

    if (issues.length) return res.status(400).json(buildError(issues));
    next();
  };
};

export const validateQuery = (schema: ZodType): RequestHandler => {
  return (req, res, next) => {
    const r = schema.safeParse(req.query);
    if (!r.success) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid query parameters',
        details: r.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
      });
    }
    next();
  };
};

export const validateParams = (schema: ZodType): RequestHandler => {
  return (req, res, next) => {
    const r = schema.safeParse(req.params);
    if (!r.success) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid route parameters',
        details: r.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
      });
    }
    next();
  };
};
