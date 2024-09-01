const CommentResponseDto = require("../dtos/responses/commentsDto");
const CommentRequestDto = require("../dtos/requests/commentsDto");
const AppResponseDto = require("../dtos/responses/appResponseDto");
const Comment = require("../models/index").Comment;
const _ = require("lodash");
const User = require("../models/index").User;

// get all comments
exports.getAllComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 5;
    const offset = (page - 1) * pageSize;

    const comments = await Comment.findAndCountAll({
      attributes: ["id", "content", "rating"],
      offset,
      limit: pageSize,
      include: [{ model: User }],
    });

    const response = CommentResponseDto.buildPagedList(
      comments.rows,
      page,
      pageSize,
      comments.count,
      req.baseUrl,
      true
    );

    res.json(response);
  } catch (error) {
    console.error("Error retrieving comments:", error);
    res.status(500).json({
      message: "Failed to retrieve comments",
      error,
    });
  }
};

exports.getCommentsFromProduct = function (req, res, next) {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 5;
  const offset = (page - 1) * pageSize;

  return Comment.findAndCountAll({
    where: { productId: req.product_id },
    attributes: ["content", "rating"],
    offset,
    limit: pageSize,
    include: [
      {
        model: User,
        attributes: ["id", "username"],
      },
    ],
  })
    .then(function (comments) {
      const commentsCount = comments.count;
      return res.json(
        CommentResponseDto.buildPagedList(
          comments.rows,
          page,
          pageSize,
          commentsCount,
          req.baseUrl,
          true
        )
      );
    })
    .catch((err) => {
      return res.json(AppResponseDto.buildSuccessWithMessages(err.message));
    });
};

exports.createComment = function (req, res, next) {
  // Check if the user has already posted a comment on the same product
  Comment.findOne({
    where: {
      productId: req.body.productId, // Use req.body.productId for consistency
      userId: req.user.id,
    },
  })
    .then((existingComment) => {
      if (existingComment) {
        return res.status(400).json({
          error: "You have already posted a comment on this product.",
        });
      }

      // If no existing comment, proceed to create the new comment
      Comment.create({
        productId: req.body.productId, // Use req.body.productId
        userId: req.user.id,
        content: req.body.content,
        rating: req.body.rating,
      })
        .then((comment) => {
          return res.json(
            CommentResponseDto.buildDetails(comment, false, false)
          );
        })
        .catch((err) => {
          return res
            .status(500)
            .json(AppResponseDto.buildWithErrorMessages(err.message));
        });
    })
    .catch((err) => {
      return res
        .status(500)
        .json(AppResponseDto.buildWithErrorMessages(err.message));
    });
};

exports.deleteComment = function (req, res, next) {
  req.comment
    .destroy()
    .then((result) => {
      return res.json(
        AppResponseDto.buildSuccessWithMessages("comment removed successfully")
      );
    })
    .catch((err) => {
      return res.json(AppResponseDto.buildWithErrorMessages("Error " + err));
    });
};

exports.getCommentDetails = function (req, res, next) {
  return res.json(CommentResponseDto.buildDetails(req.comment, true, true));
};
