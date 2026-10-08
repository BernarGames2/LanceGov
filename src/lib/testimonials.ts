export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
  cityUf: string;
  /** Caminho em /public ou URL liberada em next.config (images.remotePatterns). */
  photo?: string;
};

/**
 * Depoimentos reais, só com autorização por escrito. Enquanto a lista estiver
 * vazia, o bloco de depoimentos não aparece no site.
 */
export const testimonials: Testimonial[] = [];
