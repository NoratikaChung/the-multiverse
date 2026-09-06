export function getProjectUrl(project) {
  const targetUrl = import.meta.env.PROD
    ? (project.productionUrl || project.localUrl)
    : project.localUrl;

  return targetUrl;
}
