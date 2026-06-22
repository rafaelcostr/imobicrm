import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/vitrine", "/captura", "/privacidade"],
        disallow: [
          "/api/",
          "/dashboard",
          "/super-admin",
          "/login",
          "/cadastro",
          "/recuperar-senha",
          "/redefinir-senha",
          "/leads",
          "/imoveis",
          "/funil",
          "/negocios",
          "/comissoes",
          "/agenda",
          "/whatsapp",
          "/relatorios",
          "/corretor",
          "/busca",
          "/configuracoes",
        ],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
