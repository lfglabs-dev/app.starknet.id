import Link from "next/link";

export default function RemovedPage() {
  return (
    <section className="page narrow empty-state">
      <div className="eyebrow">Product simplified</div>
      <h1>This feature is no longer part of the mainnet app.</h1>
      <p>
        The frontend now focuses on identity minting, .stark registration and
        renewal, and on-chain identity management. Campaigns, subscriptions,
        social verification, external domains, and newsletters were retired.
      </p>
      <Link className="button button-primary" href="/identities">Manage identities</Link>
    </section>
  );
}
