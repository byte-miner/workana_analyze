"use client";

import { MapPin, DollarSign, Target } from "lucide-react";
import { SiteLayout } from "@/components/SiteLayout";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import {
  coreFacts,
  offices,
  feeStructure,
  regionRoles,
  registeredCountries,
  uniqueRegisteredCountryNames,
} from "@/data/workanaData";
import { RegisteredCountryCard } from "@/components/RegisteredCountryCard";
import { CountryFlag } from "@/components/CountryFlag";
import { ActiveCountriesExplorer } from "@/components/ActiveCountriesExplorer";
import { activePlatformCountryCount } from "@/data/workanaActiveCountries";

export default function AboutPage() {
  const registeredCountryList = uniqueRegisteredCountryNames(registeredCountries);

  return (
    <SiteLayout>
      <Breadcrumbs items={[{ label: "About" }]} />

      <h1 className="workana-gradient-text text-3xl font-bold">About Workana</h1>
      <p className="mt-2 max-w-2xl text-[var(--muted)]">
        The story behind Latin America&apos;s leading freelance marketplace.
      </p>

      <section className="mt-8 workana-panel p-6">
        <h2 className="text-xl font-semibold" style={{ color: "var(--workana-navy)" }}>
          History &amp; Founding
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          Workana was founded in <strong>{coreFacts.founded}</strong> in{" "}
          <strong>{coreFacts.foundedIn}</strong> by{" "}
          {coreFacts.founders.join(", ")}. The platform raised a{" "}
          <strong>{coreFacts.funding.amount} {coreFacts.funding.round}</strong> from{" "}
          {coreFacts.funding.investor} in {coreFacts.funding.year}, cementing its position as the
          dominant freelance marketplace for Spanish and Portuguese-speaking markets.
        </p>
      </section>

      <section className="mt-10 workana-panel p-6">
        <h2 className="mb-2 text-xl font-semibold" style={{ color: "var(--workana-navy)" }}>
          Active Freelancers &amp; Clients Worldwide
        </h2>
        <p className="mb-4 text-sm text-[var(--muted)]">
          {activePlatformCountryCount} countries where users can register as freelancers, post projects as
          clients, or both — based on Workana&apos;s platform country filters.
        </p>
        <ActiveCountriesExplorer />
      </section>

      <section className="mt-8">
        <h2 className="mb-2 flex items-center gap-2 text-xl font-semibold" style={{ color: "var(--workana-navy)" }}>
          <MapPin className="h-5 w-5" style={{ color: "var(--accent)" }} />
          Legal Registration (Corporate Entities)
        </h2>
        <p className="mb-4 text-sm text-[var(--muted)]">
          Workana LLC (Delaware, USA) is the parent company per official Terms. It operates through
          registered offices and subsidiaries in {registeredCountryList.length} countries:
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          {registeredCountryList.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-2 rounded-[10px] border px-3 py-1.5 text-sm font-medium"
              style={{ borderColor: "var(--border-color)", color: "var(--color-text)" }}
            >
              <CountryFlag country={name} size={16} />
              {name}
            </span>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {registeredCountries.map((entry, i) => (
            <RegisteredCountryCard key={`${entry.country}-${entry.entityName}-${i}`} entry={entry} />
          ))}
        </div>
        <p className="mt-4 text-xs text-[var(--muted)]">
          Sources: Workana Terms &amp; Conditions, public filings, Craft.co, and Workana press releases.
          The platform serves users globally; these are documented legal entities and registered offices.
        </p>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold" style={{ color: "var(--workana-navy)" }}>
          <MapPin className="h-5 w-5" style={{ color: "var(--accent)" }} />
          Office Locations
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {offices.map((office) => (
            <div key={office.city} className="workana-project-card">
              <span
                className="inline-block rounded-[10px] px-2 py-0.5 text-xs font-semibold text-white"
                style={{ background: office.type === "HQ" ? "var(--accent)" : "var(--workana-vibrant-purple)" }}
              >
                {office.type}
              </span>
              <div className="mt-2 flex items-center gap-2">
                <CountryFlag country={office.country} size={18} />
                <h3 className="font-semibold" style={{ color: "var(--workana-navy)" }}>
                  {office.city}
                </h3>
              </div>
              <p className="text-sm text-[var(--muted)]">{office.country}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 workana-panel p-6">
        <h2 className="flex items-center gap-2 text-xl font-semibold" style={{ color: "var(--workana-navy)" }}>
          <Target className="h-5 w-5" style={{ color: "var(--accent)" }} />
          Why Workana Was Born
        </h2>
        <ul className="mt-4 space-y-3 text-sm text-gray-600">
          <li className="flex gap-2">
            <span style={{ color: "var(--check-color)" }}>•</span>
            <span><strong>Payment security</strong> — escrow-protected transactions for remote work</span>
          </li>
          <li className="flex gap-2">
            <span style={{ color: "var(--check-color)" }}>•</span>
            <span><strong>Language democratization</strong> — native Spanish/Portuguese platform experience</span>
          </li>
          <li className="flex gap-2">
            <span style={{ color: "var(--check-color)" }}>•</span>
            <span><strong>Bypassing local regulations</strong> — enabling cross-border freelance contracts legally</span>
          </li>
        </ul>
        <p className="mt-4 text-sm italic text-[var(--muted)]">{coreFacts.mission}</p>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold" style={{ color: "var(--workana-navy)" }}>
          <DollarSign className="h-5 w-5" style={{ color: "var(--accent)" }} />
          Fee Structure
        </h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="workana-panel p-6">
            <h3 className="font-semibold" style={{ color: "var(--workana-navy)" }}>For Clients</h3>
            <p className="mt-2 text-3xl font-bold" style={{ color: "var(--accent)" }}>
              {feeStructure.clients.serviceFee}
            </p>
            <p className="text-sm text-[var(--muted)]">Service fee</p>
            <p className="mt-3 text-sm text-gray-600">{feeStructure.clients.summary}</p>
          </div>
          <div className="workana-panel p-6">
            <h3 className="font-semibold" style={{ color: "var(--workana-navy)" }}>For Freelancers</h3>
            <p className="mt-2 text-sm text-[var(--muted)]">{feeStructure.freelancers.summary}</p>
            <ul className="mt-4 space-y-3">
              {feeStructure.freelancers.tiers.map((tier) => (
                <li
                  key={tier.range}
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                  style={{ borderColor: "var(--header-border)" }}
                >
                  <span className="text-sm" style={{ color: "var(--workana-navy)" }}>{tier.range}</span>
                  <span className="text-lg font-bold" style={{ color: "var(--accent)" }}>{tier.rate}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-4 text-xl font-semibold" style={{ color: "var(--workana-navy)" }}>
          Regional Roles
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {Object.values(regionRoles).map((region) => (
            <div key={region.label} className="workana-panel p-5">
              <h3 className="text-sm font-semibold" style={{ color: "var(--workana-vibrant-purple)" }}>
                {region.label}
              </h3>
              <ul className="mt-3 space-y-2">
                {region.countries.map((c) => (
                  <li key={c.country} className="text-sm">
                    <span className="font-medium" style={{ color: "var(--workana-navy)" }}>{c.country}</span>
                    <span className="text-[var(--muted)]"> — {c.role}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </SiteLayout>
  );
}
