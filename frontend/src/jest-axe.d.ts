import { AxeResults } from 'axe-core';

declare module 'jest-axe' {
    export function axe(container: Element | Document): Promise<AxeResults>;
    export function toHaveNoViolations(results: AxeResults): { pass: boolean; message: () => string };
}

declare module 'jest-axe/extend-expect';

declare namespace jest {
    interface Matchers<R> {
        toHaveNoViolations(): R;
    }
}
