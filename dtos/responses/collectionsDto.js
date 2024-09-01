const PageMetaDto = require("./pageMetaDto");

function buildPagedList(tags, page, pageSize, totalItemCount, basePath) {
  return {
    success: true,
    page_meta: PageMetaDto.build(
      tags.length,
      page,
      pageSize,
      totalItemCount,
      basePath
    ),
    ...buildDtos(tags),
  };
}

function buildDtos(collections) {
  if (!collections) return { collections: [] };
  return {
    collections: collections.map((collection) => buildDto(collection, true)),
  };
}

function buildDto(collection, includeUrls = false) {
  const summary = {
    id: collection.id,
    name: collection.name,
    description: collection.description,
  };

  return summary;
}

module.exports = {
  buildDtos,
  buildPagedList,
  buildDto,
};
