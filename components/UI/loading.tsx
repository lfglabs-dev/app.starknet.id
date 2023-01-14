import React, { FunctionComponent } from "react";

type LoadingProps = {
  state?: 'loading' | 'success' | 'error';
};

const Loading: FunctionComponent<LoadingProps> = ({ state='loading' }) => {
  const color = state === 'loading' ? 'gray' : state === 'success' ? 'var(--green)' : 'red';

  return <span className="relative flex h-3 w-3">
      <span style={{ backgroundColor: color }} className={`${state === 'loading' && 'animate-ping'} absolute inline-flex h-full w-full rounded-full opacity-75`}></span>
      <span style={{ backgroundColor: color }} className={`relative inline-flex transition-all rounded-full h-3 w-3`}></span>
    </span>
};

export default Loading;
