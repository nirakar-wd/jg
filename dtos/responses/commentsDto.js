const UserDto = require("./usersDto");

const PageMetaDto = require("./pageMetaDto");

function buildPagedList(
  comments,
  page,
  pageSize,
  totalCommentsCount,
  basePath,
  includeUser = false,
  includeProduct = false
) {
  return {
    success: true,
    page_meta: PageMetaDto.build(
      comments.length,
      page,
      pageSize,
      totalCommentsCount,
      basePath
    ),
    ...buildDtos(comments, includeUser, includeProduct),
  };
}

function buildDtos(comments, includeUser = false, includeProduct = false) {
  if (comments == null) return { comments: [] };
  return {
    comments: comments.map((comment) =>
      buildDto(comment, includeUser, includeProduct)
    ),
  };
}

function buildDto(comment, includeUser = false, includeProduct = false) {
  const summary = {
    id: comment.id,
    content: comment.content,
    rating: comment.rating,
    userId: comment.userId,
  };

  if (includeProduct && comment.product) {
    summary.product = {
      id: comment.product.id,
      name: comment.product.name,
      slug: comment.product.slug,
    };
  }

  if (includeUser && comment.user)
    summary.user = UserDto.buildOnlyForIdAndUsername(comment.user);

  return summary;
}

function buildDetails(comment, includeUser = false, includeProduct = false) {
  return {
    success: true,
    ...buildDto(comment, includeUser, includeProduct),
    created_at: comment.createdAt,
    updated_at: comment.updatedAt,
  };
}

module.exports = {
  buildDtos,
  buildDto,
  buildDetails,
  buildPagedList,
};
