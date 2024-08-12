module.exports = (sequelize, DataTypes) => {
  const Feedback = sequelize.define(
    "feedbacks",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "userId",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date(),
        field: "created_at",
      },

      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: new Date(),
        field: "updated_at",
      },
    },
    {
      tableName: "feedbacks",
    }
  );

  Feedback.associate = (models) => {
    Feedback.belongsTo(models.User /*, { foreignKey: 'userId' }*/);
  };

  return Feedback;
};
