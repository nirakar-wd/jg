const TagDto = require("./tagsDto");
const CategoryDto = require("./categoriesDto");

exports.buildHome = (tags, categories) => {
  return {
    tags: tags.map((tag) => TagDto.buildDto(tag, true)),
    categories: categories.map((tag) => CategoryDto.buildDto(tag, true)),
  };
};
