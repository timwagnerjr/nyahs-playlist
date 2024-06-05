export default function Login() {
  return (
    <div className="flex justify-center items-center h-screen">
      <a
        href="/api/auth/login"
        className="bg-green-500 text-white p-4 rounded-lg"
      >
        Log in with Spotify
      </a>
    </div>
  );
}
