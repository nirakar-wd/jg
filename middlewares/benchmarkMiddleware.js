exports.benchmark = (req, res, next) => {
  const startTime = new Date().getTime();

  res.on("finish", () => {
    const elapsed = (new Date().getTime() - startTime) / 1000;
    console.log("It took " + elapsed + " seconds");
    // Optionally, you can set a custom response header here
    // res.set("X-Perf-Time", elapsed);
  });

  next(); // Pass control to the next middleware or route handler
};
