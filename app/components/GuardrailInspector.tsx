'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  ShieldCheck,
  WarningCircle,
  Clock,
  Database,
  Info,
  CheckCircle,
  FileText,
  SlidersHorizontal,
  ArrowClockwise,
  DownloadSimple
} from '@phosphor-icons/react';
import { ProvenanceType, AuditEvent } from '@/domain/models';

export interface MemoryScatterPoint {
  id: string;
  title: string;
  date: Date;
  provenance: ProvenanceType;
  confidenceScore: number; // 0.0 to 1.0
  sourceRef: string;
  wordCount: number;
  contributor: string;
}

const SAMPLE_AUDIT_LOG_HISTORY: AuditEvent[] = [
  {
    id: 'audit-1792078001-a1b2c',
    timestamp: '2026-10-15T16:40:01.120Z',
    userId: 'user-maya-8921',
    profileId: 'profile-thomas-1944',
    eventType: 'AUTHZ_DECISION',
    payload: {
      authorized: true,
      requestId: 'req-98012',
      selectedRenderer: 'ORIGINAL_RECORDING',
      textHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      decisionRule: 'VERIFIED_FIRST_PERSON evidence matched in vault (VM_July2018_Trailhead.wav)',
      safetyState: 'NORMAL',
    },
  },
  {
    id: 'audit-1792078045-d3e4f',
    timestamp: '2026-10-15T16:42:15.890Z',
    userId: 'user-maya-8921',
    profileId: 'profile-thomas-1944',
    eventType: 'GROUNDING_EVAL',
    payload: {
      query: 'Did you like the Olympic Park ridge walk?',
      retrievedMemoriesCount: 2,
      topMemoryId: 'm1',
      provenanceType: 'VERIFIED_FIRST_PERSON',
      confidenceScore: 0.98,
      groundedClaims: [
        {
          claim: 'Walked the ridge at Olympic Park in July 2018',
          evidenceRef: 'VM_July2018_Trailhead.wav',
          supportLevel: 'DIRECT_SOURCE',
        },
      ],
    },
  },
  {
    id: 'audit-1792078102-g5h6j',
    timestamp: '2026-10-15T16:45:30.410Z',
    userId: 'user-maya-8921',
    profileId: 'profile-thomas-1944',
    eventType: 'AUTHZ_DECISION',
    payload: {
      authorized: false,
      requestId: 'req-98015',
      reason: 'Question targeted 2016 (4-year void gap). No verified 1st-person evidence exists.',
      requestedMode: 'PRESENCE',
      actionTaken: 'FAIL_CLOSED: Redirected user to neutral Guide companion',
    },
  },
  {
    id: 'audit-1792078120-k7m8n',
    timestamp: '2026-10-15T16:46:00.220Z',
    userId: 'user-maya-8921',
    profileId: 'profile-thomas-1944',
    eventType: 'MODE_TRANSITION',
    payload: {
      fromMode: 'PRESENCE',
      toMode: 'GUIDE',
      transitionReason: 'INSUFFICIENT_EVIDENCE_VOID_GAP',
      liveGuideEnabled: false,
      modelUsed: 'gemini-3.8-flash',
    },
  },
  {
    id: 'audit-1792078188-p9q0r',
    timestamp: '2026-10-15T16:48:12.750Z',
    userId: 'user-maya-8921',
    profileId: 'profile-thomas-1944',
    eventType: 'MEDIA_RENDER',
    payload: {
      rendererPipeline: 'MuseTalk_1.5_Preflight_Check',
      audioDurationSeconds: 7.2,
      bboxShift: 0,
      validationPassed: true,
      complianceNote: 'Output restricted to verified audio-driven mouth animation',
    },
  },
];

const PROVENANCE_CONFIG: Record<
  ProvenanceType,
  { label: string; color: string; description: string }
> = {
  VERIFIED_FIRST_PERSON: {
    label: 'Verified 1st Person',
    color: '#10b981', // emerald
    description: 'Direct audio recording or primary diary/quote from represented person.',
  },
  ATTRIBUTED_RECOLLECTION: {
    label: 'Attributed Story',
    color: '#38bdf8', // sky cyan
    description: 'Family or friend recollection describing the person.',
  },
  USER_CONTEXT: {
    label: 'User Context',
    color: '#f59e0b', // amber
    description: 'Session contextual notes supplied by active user.',
  },
  GENERAL_SUPPORT: {
    label: 'General Support',
    color: '#a855f7', // purple
    description: 'Contextual timeline or historical facts (non-personal).',
  },
  GENERATED_CONTENT: {
    label: 'Generated Content',
    color: '#f43f5e', // rose
    description: 'Synthetic/AI text. Strictly forbidden as historical evidence.',
  },
};

// Initial loaded memory bank sample spanning 2012-2024
const INITIAL_MEMORY_BANK: MemoryScatterPoint[] = [
  {
    id: 'm1',
    title: 'Olympic Park Ridge Trail Audio',
    date: new Date('2018-07-14'),
    provenance: 'VERIFIED_FIRST_PERSON',
    confidenceScore: 0.98,
    sourceRef: 'VM_July2018_Trailhead.wav',
    wordCount: 145,
    contributor: 'Grandfather Thomas',
  },
  {
    id: 'm2',
    title: 'Porch Rain Notebook Journal',
    date: new Date('2018-10-02'),
    provenance: 'VERIFIED_FIRST_PERSON',
    confidenceScore: 0.95,
    sourceRef: 'Olympic_Park_Journal_Entry.pdf#pg42',
    wordCount: 310,
    contributor: 'Grandfather Thomas',
  },
  {
    id: 'm3',
    title: 'Claire Birthday Story at the Lake',
    date: new Date('2019-06-21'),
    provenance: 'ATTRIBUTED_RECOLLECTION',
    confidenceScore: 0.82,
    sourceRef: 'Claire_Oral_History_Tape.mp3',
    wordCount: 420,
    contributor: 'Claire (Sister)',
  },
  {
    id: 'm4',
    title: 'Retirement Party Speech',
    date: new Date('2013-05-10'),
    provenance: 'VERIFIED_FIRST_PERSON',
    confidenceScore: 0.94,
    sourceRef: 'Retirement_Speech_13.mp3',
    wordCount: 512,
    contributor: 'Grandfather Thomas',
  },
  {
    id: 'm5',
    title: 'Family Thanksgiving Recollection',
    date: new Date('2020-11-26'),
    provenance: 'ATTRIBUTED_RECOLLECTION',
    confidenceScore: 0.78,
    sourceRef: 'Thanksgiving_2020_Letter.txt',
    wordCount: 230,
    contributor: 'Maya (Granddaughter)',
  },
  {
    id: 'm6',
    title: 'Woodworking Workshop Notes',
    date: new Date('2014-03-18'),
    provenance: 'VERIFIED_FIRST_PERSON',
    confidenceScore: 0.91,
    sourceRef: 'Shop_Binder_Scan.pdf',
    wordCount: 180,
    contributor: 'Grandfather Thomas',
  },
  {
    id: 'm7',
    title: '2023 Reflection on Grandpa Garden',
    date: new Date('2023-04-12'),
    provenance: 'USER_CONTEXT',
    confidenceScore: 0.65,
    sourceRef: 'Session_Notes_April2023.txt',
    wordCount: 110,
    contributor: 'Maya',
  },
  {
    id: 'm8',
    title: 'Synthetic Grief Affirmation (Blocked)',
    date: new Date('2024-02-10'),
    provenance: 'GENERATED_CONTENT',
    confidenceScore: 0.2,
    sourceRef: 'AI_Model_Screening.log',
    wordCount: 85,
    contributor: 'System Generator',
  },
];

export default function GuardrailInspector() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<MemoryScatterPoint | null>(null);
  const [selectedTier, setSelectedTier] = useState<ProvenanceType | 'ALL'>('ALL');
  const [data, setData] = useState<MemoryScatterPoint[]>(INITIAL_MEMORY_BANK);

  // Grounding gap ranges: time spans where no VERIFIED_FIRST_PERSON exists
  const gapBands = [
    { start: new Date('2014-08-01'), end: new Date('2018-01-01'), label: '4-Year Void Gap (2014-2018)' },
    { start: new Date('2019-01-01'), end: new Date('2022-12-31'), label: 'No 1st-Person Evidence Post-2018' },
  ];

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 840;
    const height = 420;
    const margin = { top: 30, right: 30, bottom: 50, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Filter points based on selected tier
    const filteredPoints = selectedTier === 'ALL' ? data : data.filter((d) => d.provenance === selectedTier);

    const g = svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale: Chronological Timeline
    const xScale = d3
      .scaleTime()
      .domain([new Date('2012-01-01'), new Date('2024-12-31')])
      .range([0, innerWidth]);

    // Y Scale: Grounding Confidence (0 to 1)
    const yScale = d3.scaleLinear().domain([0, 1.05]).range([innerHeight, 0]);

    // Draw Grounding Gap Shaded Void Zones (Red/Amber hazard overlay)
    gapBands.forEach((gap) => {
      const xStart = xScale(gap.start);
      const xEnd = xScale(gap.end);
      const rectWidth = Math.max(0, xEnd - xStart);

      const gapGroup = g.append('g').attr('class', 'grounding-gap');

      gapGroup
        .append('rect')
        .attr('x', xStart)
        .attr('y', 0)
        .attr('width', rectWidth)
        .attr('height', innerHeight)
        .attr('fill', '#ef4444')
        .attr('opacity', 0.08)
        .attr('stroke', '#ef4444')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4 4');

      gapGroup
        .append('text')
        .attr('x', xStart + rectWidth / 2)
        .attr('y', 20)
        .attr('text-anchor', 'middle')
        .attr('fill', '#f87171')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .text(`⚠ ${gap.label}`);
    });

    // Grid lines
    g.append('g')
      .attr('class', 'grid')
      .attr('opacity', 0.15)
      .call(d3.axisLeft(yScale).tickSize(-innerWidth).tickFormat(() => ''));

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale).ticks(7))
      .attr('color', '#64748b')
      .attr('font-size', '11px');

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format('.0%')))
      .attr('color', '#64748b')
      .attr('font-size', '11px');

    // Axis Labels
    g.append('text')
      .attr('x', innerWidth / 2)
      .attr('y', innerHeight + 40)
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px')
      .attr('text-anchor', 'middle')
      .text('Memory Timeline (Chronological Date)');

    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -innerHeight / 2)
      .attr('y', -42)
      .attr('fill', '#94a3b8')
      .attr('font-size', '11px')
      .attr('text-anchor', 'middle')
      .text('Grounding Confidence Score');

    // Scatter Points
    const circles = g
      .selectAll('.dot')
      .data(filteredPoints)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('cx', (d) => xScale(d.date))
      .attr('cy', (d) => yScale(d.confidenceScore))
      .attr('r', (d) => Math.max(6, Math.min(14, Math.sqrt(d.wordCount) * 0.6)))
      .attr('fill', (d) => PROVENANCE_CONFIG[d.provenance].color)
      .attr('fill-opacity', 0.8)
      .attr('stroke', '#080c14')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('click', (_, d) => setSelectedPoint(d))
      .on('mouseenter', function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', (d: any) => Math.max(8, Math.min(16, Math.sqrt(d.wordCount) * 0.6)) + 3)
          .attr('stroke', '#ffffff')
          .attr('stroke-width', 2.5);
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', (d: any) => Math.max(6, Math.min(14, Math.sqrt(d.wordCount) * 0.6)))
          .attr('stroke', '#080c14')
          .attr('stroke-width', 2);
      });
  }, [data, selectedTier]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-6xl mx-auto text-slate-200 font-sans">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 rounded-md bg-emerald-500/20 text-emerald-300">
              <ShieldCheck className="text-lg" />
            </span>
            <h2 className="text-lg font-semibold tracking-wide text-slate-100">
              GuardrailInspector &bull; Provenance Distribution
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            D3 Grounding Diagnostic: Identifies evidence density and historical void zones where persona speech must fail-closed.
          </p>
        </div>

        {/* ACTIONS & TIER FILTER PILLS */}
        <div className="flex flex-wrap items-center gap-2">
          {/* EXPORT AUDIT LOG BUTTON */}
          <button
            onClick={() => {
              const exportPayload = {
                application: 'ParamSathya',
                exportTimestamp: new Date().toISOString(),
                complianceProfileId: 'profile-thomas-1944',
                totalEvents: SAMPLE_AUDIT_LOG_HISTORY.length,
                guardrailEngineVersion: 'Enterprise_Agent_Guardrail_v1',
                auditLedger: SAMPLE_AUDIT_LOG_HISTORY,
              };

              const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute('href', dataStr);
              downloadAnchor.setAttribute('download', `paramsathya_audit_log_${new Date().toISOString().split('T')[0]}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-xs font-semibold text-white shadow-md shadow-emerald-950/40 transition flex items-center gap-1.5"
            title="Download formatted JSON audit ledger for external compliance"
          >
            <DownloadSimple className="text-sm" />
            <span>Export Audit Log JSON</span>
          </button>

          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 border border-slate-800 p-1 rounded-xl text-xs">
            <button
              onClick={() => setSelectedTier('ALL')}
              className={`px-3 py-1 rounded-lg transition font-medium ${
                selectedTier === 'ALL' ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Tiers ({data.length})
            </button>
            {(Object.keys(PROVENANCE_CONFIG) as ProvenanceType[]).map((tier) => (
              <button
                key={tier}
                onClick={() => setSelectedTier(tier)}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1.5 ${
                  selectedTier === tier
                    ? 'bg-slate-800 text-white border border-slate-600'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: PROVENANCE_CONFIG[tier].color }}
                ></span>
                <span>{PROVENANCE_CONFIG[tier].label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN D3 SCATTER PLOT CARD */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3 text-xs">
          <div className="flex items-center gap-2">
            <Database className="text-cyan-400" />
            <span className="font-semibold text-slate-300">Memory Bank Provenance Matrix (2012 - 2024)</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500/30 border border-red-500 inline-block"></span>
              Grounding Void Gap
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
              Verified 1st Person
            </span>
          </div>
        </div>

        {/* SVG Container */}
        <div className="w-full overflow-x-auto bg-[#050811]/90 rounded-xl border border-slate-800/80 p-2">
          <svg ref={svgRef} className="w-full h-auto min-w-[720px] select-none"></svg>
        </div>
      </div>

      {/* INSPECTION DRAWER & GAP SUMMARY */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* LEFT: GROUNDING GAP VERDICT */}
        <div className="md:col-span-6 bg-slate-900/50 border border-amber-500/20 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-amber-300 font-medium text-xs">
            <WarningCircle className="text-base shrink-0" />
            <span>Identified Grounding Gaps & Policy Enforcement</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            The memory bank contains a <strong className="text-amber-200">4-year void gap (2014 &ndash; 2018)</strong> and lacks verified 1st-person evidence after October 2018. 
          </p>
          <div className="p-3 bg-amber-950/30 border border-amber-800/40 rounded-lg text-xs space-y-1 text-slate-300">
            <div className="flex items-center justify-between text-amber-200 font-semibold">
              <span>Fail-Closed Status:</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-900/60">ACTIVE</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Any user questions targeting 2015&ndash;2017 will be intercepted by <code className="text-cyan-300">DefaultRenderAuthorizationService</code> and redirected to the neutral Guide companion.
            </p>
          </div>
        </div>

        {/* RIGHT: SELECTED NODE INSPECTION CARD */}
        <div className="md:col-span-6 bg-slate-900/50 border border-white/10 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 flex items-center gap-1.5 uppercase tracking-wider font-semibold">
                <FileText className="text-cyan-400" /> Selected Memory Inspection
              </span>
              {selectedPoint && (
                <span
                  className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                  style={{
                    backgroundColor: `${PROVENANCE_CONFIG[selectedPoint.provenance].color}20`,
                    color: PROVENANCE_CONFIG[selectedPoint.provenance].color,
                  }}
                >
                  {PROVENANCE_CONFIG[selectedPoint.provenance].label}
                </span>
              )}
            </div>

            {selectedPoint ? (
              <div className="space-y-2 text-xs">
                <h4 className="text-sm font-semibold text-slate-100">{selectedPoint.title}</h4>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Date Recorded:</span>
                    <span>{selectedPoint.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Confidence:</span>
                    <span className="text-emerald-400 font-mono font-bold">{(selectedPoint.confidenceScore * 100).toFixed(0)}% Grounded</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Contributor:</span>
                    <span>{selectedPoint.contributor}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Source Ref:</span>
                    <span className="truncate block font-mono text-cyan-300">{selectedPoint.sourceRef}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 flex flex-col items-center">
                <SlidersHorizontal className="text-3xl text-slate-700 mb-2" />
                <p>Click on any circle in the scatter plot above to inspect its grounding verification data.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AUDIT LOG HISTORY SECTION WITH JSON EXPORT PREVIEW */}
      <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="text-cyan-400 text-base" />
            <h3 className="text-sm font-semibold text-slate-100">Live Audit Ledger &amp; Compliance Events</h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {SAMPLE_AUDIT_LOG_HISTORY.length} Events Logged
            </span>
          </div>

          <button
            onClick={() => {
              const exportPayload = {
                application: 'ParamSathya',
                exportTimestamp: new Date().toISOString(),
                complianceProfileId: 'profile-thomas-1944',
                totalEvents: SAMPLE_AUDIT_LOG_HISTORY.length,
                guardrailEngineVersion: 'Enterprise_Agent_Guardrail_v1',
                auditLedger: SAMPLE_AUDIT_LOG_HISTORY,
              };

              const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute('href', dataStr);
              downloadAnchor.setAttribute('download', `paramsathya_audit_log_${new Date().toISOString().split('T')[0]}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium transition"
          >
            <DownloadSimple className="text-sm" />
            <span>Download Formatted JSON (.json)</span>
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-800/80 bg-slate-950/60">
          <table className="w-full text-left text-xs font-mono text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Event ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Details / Decision Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {SAMPLE_AUDIT_LOG_HISTORY.map((ev) => (
                <tr key={ev.id} className="hover:bg-slate-900/40 transition">
                  <td className="py-2.5 px-3 text-cyan-300 font-semibold">{ev.id}</td>
                  <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                    {new Date(ev.timestamp).toLocaleTimeString()} ({new Date(ev.timestamp).toISOString().split('T')[0]})
                  </td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        ev.eventType === 'AUTHZ_DECISION'
                          ? (ev.payload as any).authorized
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                            : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                          : ev.eventType === 'GROUNDING_EVAL'
                          ? 'bg-sky-950 text-sky-300 border border-sky-800/60'
                          : 'bg-purple-950 text-purple-300 border border-purple-800/60'
                      }`}
                    >
                      {ev.eventType}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-300 text-[11px]">
                    {(ev.payload as any).decisionRule ||
                      (ev.payload as any).reason ||
                      `Renderer: ${(ev.payload as any).rendererPipeline || (ev.payload as any).fromMode + ' -> ' + (ev.payload as any).toMode}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
