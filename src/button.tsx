import { cx } from './utils';

export function Button(props: JSX.HTMLAttributes<HTMLButtonElement>) {
  return <button type="button" {...props} class={cx('button', props.class)} />;
}

export function LinkButton(props: JSX.HTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} class={cx('button', props.class)} />;
}

export function TwitterShareButton({
  class: className,
  text,
  ...props
}: JSX.HTMLAttributes<HTMLAnchorElement> & { text: string }) {
  return (
    <LinkButton
      class={cx('button-twitter', className)}
      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`}
      target="_blank"
      {...props}
    />
  );
}
