/** Clock and randomness, injected so every rule stays a pure function. */
export interface EngineOpts {
  /** Today as "YYYY-MM-DD". */
  today?: string;
  now?: number;
  rng?: () => number;
}
