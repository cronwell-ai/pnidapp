import GoogleSignIn from "../components/google-button";
import GithubSignIn from "../components/github-button";

export default function OAuthGrid() {
  return (
    <div>
      <div className="relative mt-10">
        <div aria-hidden="true" className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-sm font-medium leading-6">
          <span className="bg-white dark:bg-black px-6 text-primary">Or continue with</span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4">
        <GoogleSignIn />
        <GithubSignIn />
      </div>
    </div>
  )
}