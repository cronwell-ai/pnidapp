'use client'
import React, { useState, useEffect } from 'react';
import { Button } from './button';
import Link from 'next/link';

const GithubLogo = () => {
  return (
    <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true" className="h-5 w-5 fill-[#6c7178]">
      <path
        d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
        clipRule="evenodd"
        fillRule="evenodd"
      />
    </svg>
  )
}

const GitHubStarButton = ({ user, repo }: { user: string, repo: string }) => {
  const [starCount, setStarCount] = useState(null);

  useEffect(() => {
    fetch(`https://api.github.com/repos/${user}/${repo}`)
      .then(response => response.json())
      .then(data => setStarCount(data.stargazers_count))
      .catch(error => console.error('Error fetching star count:', error));
  }, [user, repo]);

  const handleClick = () => {
    window.open(`https://github.com/${user}/${repo}`, '_blank');
  };

  return (
    <div className='flex items-center gap-0'>
      <Button
        onClick={handleClick}
        variant={'outline'}
        className="flex items-center gap-1 px-2 py-1 text-md font-semibold"
      >
        <GithubLogo />
        Star
      </Button>
      <button 
        onClick={handleClick}
        className="gh-count p-1.5 bg-background border text-primary before:border-r-background after:border-r-border text-md font-semibold">
        {starCount}
      </button>
    </div>
  );
};

export default GitHubStarButton;