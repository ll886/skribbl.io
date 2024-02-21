import Link from "next/link";
export default function Home() {
  return (
    <main>
      <div>
        Skibbl
      </div>
      <div>
            <Link href="/MakeRoom" passHref>
                Create a Room
            </Link>
        </div>
    </main>
  );
}
