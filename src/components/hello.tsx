import * as React from "react";

export interface HelloProps { compiler: string; framework: string; }

export const Hello = (props: HelloProps) => <h1>Helllo [kkojlpjk2l from {props.compiler} and {props.framework}!</h1>;