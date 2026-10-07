export default defineAppConfig({
  ui: {
    colors: {
      primary: 'nortland',
      neutral: 'slate',
    },
    button: {
      slots: {
        base: 'min-h-11 rounded-full px-5 font-extrabold uppercase tracking-[0.04em] ' +
          'focus-visible:outline-3 focus-visible:outline-offset-2 disabled:opacity-55',
      },
      variants: {
        size: {
          md: { base: 'px-5 py-2 text-sm gap-2' },
          xl: { base: 'px-6 py-2.5 text-base gap-2' },
        },
      },
    },
    input: {
      slots: {
        base: 'min-h-11 rounded-[var(--radius-card)] font-semibold ' +
          'placeholder:text-dimmed focus-visible:ring-2',
      },
      variants: {
        variant: {
          outline: 'bg-muted',
        },
      },
      compoundVariants: [
        {
          color: 'primary',
          variant: [ 'outline', 'subtle' ],
          class: 'focus-visible:ring-focus outline-focus/25',
        },
      ],
    },
    card: {
      slots: {
        root: 'rounded-[var(--radius-card)] shadow-card',
      },
    },
  },
});
