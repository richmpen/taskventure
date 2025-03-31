declare namespace JSX {
  interface IntrinsicElements {
    // Явное определение AnimatePresence как JSX-элемента
    'AnimatePresence': any;
  }
}

// Дополнительные объявления типов для framer-motion
declare module 'framer-motion' {
  export interface AnimatePresenceProps {
    children?: React.ReactNode;
    mode?: 'sync' | 'wait' | 'popLayout';
    initial?: boolean;
    onExitComplete?: () => void;
    exitBeforeEnter?: boolean;
    custom?: any;
  }

  export const AnimatePresence: React.FunctionComponent<AnimatePresenceProps>;
  
  // Добавление экспорта motion
  export const motion: {
    div: any;
    span: any;
    button: any;
    p: any;
    a: any;
    ul: any;
    li: any;
    section: any;
    article: any;
    header: any;
    footer: any;
    main: any;
    nav: any;
    h1: any;
    h2: any;
    h3: any;
    h4: any;
    h5: any;
    h6: any;
    img: any;
    svg: any;
    path: any;
    circle: any;
    rect: any;
    form: any;
    input: any;
    textarea: any;
    select: any;
    option: any;
    label: any;
    [key: string]: any;
  };
} 