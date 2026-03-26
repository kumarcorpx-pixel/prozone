"use client"

import { ExternalLink } from "lucide-react"

interface Portal {
  name: string
  url: string
  desc: string
}

const portals: Record<string, Portal[]> = {
  Immigration: [
    { name: "MOHRE", url: "https://mohre.gov.ae", desc: "Ministry of Human Resources" },
    { name: "GDRFA Dubai", url: "https://gdrfad.gov.ae", desc: "Residency & Foreigners Affairs" },
    { name: "ICP/ICA", url: "https://icp.gov.ae", desc: "Federal Identity Authority" },
    { name: "Amer", url: "https://amer.ae", desc: "Amer Service Center" },
    { name: "Tasheel", url: "https://tasheel.ae", desc: "Tasheel Service Center" },
  ],
  Licensing: [
    { name: "DET Dubai", url: "https://dubaitrade.ae", desc: "Dubai Economy & Tourism" },
    { name: "ADDED", url: "https://added.gov.ae", desc: "Abu Dhabi Economic Dev" },
    { name: "SEDD", url: "https://sedd.gov.ae", desc: "Sharjah Economic Dev" },
    { name: "DMCC", url: "https://dmcc.ae", desc: "Dubai Multi Commodities" },
    { name: "JAFZA", url: "https://jafza.ae", desc: "Jebel Ali Free Zone" },
  ],
  "Health & Tax": [
    { name: "DHA", url: "https://dha.gov.ae", desc: "Dubai Health Authority" },
    { name: "DOH", url: "https://doh.gov.ae", desc: "Abu Dhabi Health" },
    { name: "FTA", url: "https://tax.gov.ae", desc: "Federal Tax Authority" },
    { name: "MOFA", url: "https://mofa.gov.ae", desc: "Foreign Affairs" },
  ],
  Other: [
    { name: "Ejari", url: "https://ejari.ae", desc: "Dubai Tenancy" },
    { name: "TAMM", url: "https://tamm.abudhabi", desc: "Abu Dhabi Govt Services" },
    { name: "Dubai Courts", url: "https://dc.gov.ae", desc: "Dubai Courts" },
  ],
}

export function GovPortals() {
  return (
    <div className="space-y-6">
      {Object.entries(portals).map(([category, items]) => (
        <div key={category}>
          <h3 className="text-sm font-semibold text-white bg-[#1a3a6b] px-4 py-2 rounded-t-lg uppercase tracking-wider">
            {category}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 bg-gray-50 rounded-b-lg p-3 ring-1 ring-gray-200">
            {items.map((portal) => (
              <a
                key={portal.name}
                href={portal.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex flex-col justify-between bg-white rounded-lg p-4 ring-1 ring-gray-200 hover:ring-[#1a3a6b]/30 hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-sm text-gray-900 group-hover:text-[#1a3a6b] transition-colors">
                      {portal.name}
                    </h4>
                    <ExternalLink className="h-3.5 w-3.5 text-gray-400 group-hover:text-[#1a3a6b] transition-colors" />
                  </div>
                  <p className="text-xs text-gray-500 leading-snug">{portal.desc}</p>
                </div>
              </a>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
