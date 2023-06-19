/**
 * @interface Balls
 */
export default interface Balls {
  drawDate: string;
  results: Array<number>;
  bonus: number;
  jackpot?: number;
  outcome?: string;
}
