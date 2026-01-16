/**
 * Stub module for OpenTelemetry in Edge Runtime
 * Edge Runtime doesn't support native Node.js modules like OpenTelemetry
 * This stub provides empty implementations to prevent errors
 * Compatible with both CommonJS and ES modules
 */

// Create a no-op function that returns a stub object
const noop = () => ({});
const noopAsync = async () => ({});

// Create a minimal stub object that satisfies OpenTelemetry API
const stub = {
  // Context API - Next.js uses createContextKey
  createContextKey: (name) => Symbol(name || 'context-key'),
  deleteContextKey: noop,
  
  // Trace API
  trace: {
    getTracer: () => ({
      startSpan: (name) => ({
        setAttribute: noop,
        setAttributes: noop,
        addEvent: noop,
        end: noop,
        updateName: noop,
        setStatus: noop,
        isRecording: () => false,
        spanContext: () => ({
          traceId: '',
          spanId: '',
          traceFlags: 0,
        }),
      }),
      startActiveSpan: (name, optionsOrFn, fn) => {
        // Handle both signatures: startActiveSpan(name, fn) and startActiveSpan(name, options, fn)
        const actualFn = typeof optionsOrFn === 'function' ? optionsOrFn : fn;
        const span = {
          setAttribute: noop,
          setAttributes: noop,
          addEvent: noop,
          end: noop,
          updateName: noop,
          setStatus: noop,
          isRecording: () => false,
          spanContext: () => ({
            traceId: '',
            spanId: '',
            traceFlags: 0,
          }),
        };
        // If no function provided, return the span
        if (!actualFn) {
          return span;
        }
        // Call the function with the span
        const result = actualFn(span);
        // Handle both sync and async functions
        if (result && typeof result.then === 'function') {
          return result;
        }
        return result;
      },
    }),
    getSpan: () => null,
    getSpanContext: (spanOrContext) => {
      // Next.js calls this with either a span or a context
      // If it's a context (has setValue), return it as-is
      if (spanOrContext && typeof spanOrContext.setValue === 'function') {
        return spanOrContext;
      }
      
      // If it's a span, extract context and wrap it
      if (spanOrContext && typeof spanOrContext === 'object') {
        let spanCtx = null;
        if (typeof spanOrContext.spanContext === 'function') {
          spanCtx = spanOrContext.spanContext();
        } else if (spanOrContext.traceId && spanOrContext.spanId) {
          spanCtx = {
            traceId: spanOrContext.traceId,
            spanId: spanOrContext.spanId,
            traceFlags: spanOrContext.traceFlags || 0,
          };
        }
        
        // Wrap span context in a context object that supports setValue
        if (spanCtx) {
          const contextObj = {
            ...spanCtx,
            setValue: (key, value) => {
              contextObj[key] = value;
              return contextObj;
            },
            getValue: (key) => contextObj[key],
            deleteValue: (key) => {
              delete contextObj[key];
              return contextObj;
            },
          };
          return contextObj;
        }
      }
      
      // Return a context object (not a span context) that supports setValue
      const contextObj = {
        setValue: (key, value) => {
          contextObj[key] = value;
          return contextObj;
        },
        getValue: (key) => contextObj[key],
        deleteValue: (key) => {
          delete contextObj[key];
          return contextObj;
        },
      };
      return contextObj;
    },
    getActiveSpan: () => null,
    setSpan: noop,
    setSpanContext: noop,
  },
  
  // Context API
  context: {
    active: () => {
      // Return a context object that supports setValue
      const ctx = {};
      ctx.setValue = (key, value) => {
        ctx[key] = value;
        return ctx;
      };
      ctx.getValue = (key) => ctx[key];
      ctx.deleteValue = (key) => {
        delete ctx[key];
        return ctx;
      };
      return ctx;
    },
    with: (ctx, fn) => {
      // If ctx is a spanContext, wrap it in a context object
      if (ctx && typeof ctx.setValue !== 'function') {
        const contextObj = {
          setValue: (key, value) => {
            contextObj[key] = value;
            return contextObj;
          },
          getValue: (key) => contextObj[key],
          deleteValue: (key) => {
            delete contextObj[key];
            return contextObj;
          },
        };
        // Copy spanContext properties if present
        if (ctx.traceId) contextObj.traceId = ctx.traceId;
        if (ctx.spanId) contextObj.spanId = ctx.spanId;
        if (ctx.traceFlags !== undefined) contextObj.traceFlags = ctx.traceFlags;
        return fn(contextObj);
      }
      return fn(ctx || {});
    },
    setValue: (ctx, key, value) => {
      if (!ctx || typeof ctx.setValue !== 'function') {
        ctx = {
          setValue: (k, v) => {
            ctx[k] = v;
            return ctx;
          },
          getValue: (k) => ctx[k],
          deleteValue: (k) => {
            delete ctx[k];
            return ctx;
          },
        };
      }
      ctx.setValue(key, value);
      return ctx;
    },
    getValue: (ctx, key) => {
      if (!ctx) return undefined;
      if (typeof ctx.getValue === 'function') {
        return ctx.getValue(key);
      }
      return ctx[key];
    },
    deleteValue: (ctx, key) => {
      if (!ctx) return ctx;
      if (typeof ctx.deleteValue === 'function') {
        return ctx.deleteValue(key);
      }
      delete ctx[key];
      return ctx;
    },
  },
  
  // Propagation API
  propagation: {
    extract: () => ({}),
    inject: noop,
    fields: () => [],
  },
  
  // Diag API (diagnostics)
  diag: {
    setLogger: noop,
    disable: noop,
    enable: noop,
    setLogLevel: noop,
  },
  
  // Metrics API
  metrics: {
    getMeter: () => ({
      createCounter: () => ({ add: noop }),
      createUpDownCounter: () => ({ add: noop }),
      createHistogram: () => ({ record: noop }),
      createObservableCounter: () => ({ addCallback: noop }),
      createObservableGauge: () => ({ addCallback: noop }),
      createObservableUpDownCounter: () => ({ addCallback: noop }),
    }),
  },
};

// CommonJS export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = stub;
  module.exports.default = stub;
}

// ES module export (for Edge Runtime)
if (typeof exports !== 'undefined') {
  exports.default = stub;
  Object.keys(stub).forEach(key => {
    exports[key] = stub[key];
  });
}

