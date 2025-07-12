// import { Request, Response, Router } from "express";
// import redis from "../services/redis.service"; // adjust path

// const router = Router();

// router.get("/upload-status/:uploadId/:filename", async (req: Request, res: Response) => {
//   const { uploadId, filename } = req.params;

//   const key = `upload-progress:${uploadId}:${filename}`;
//   const progress = await redis.fetchData(key);

//   if (!progress) {
//     return res.status(404).json({
//       error: true,
//       message: "Upload not found or already expired",
//     });
//   }

//   return res.status(200).json({
//     error: false,
//     data: progress,
//     message: "Upload progress fetched successfully",
//   });
// });

// export default router;
