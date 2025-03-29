import { PositionKind } from "ast-types/gen/kinds";
import { namedTypes as N } from "ast-types";

export class SourceLocation<T extends N.SourceLocation> {
  start: PositionKind;
  end: PositionKind;
  source?: string | null;

  constructor(props: N.SourceLocation) {
    this.start = props.start;
    this.end = props.end;
    this.source = props.source || null;
  }
}