import {
    dateToday,
    isEmptyObject,
    leadingNum,
    strIncludesEs6,
  } from "@btffamily/pacitude";
  import { IPagination, ISearchQuery } from "./interface.util";
  
  const defineRef = (ref: any): string => {
    return ref === "id" ? "_id" : ref;
  };
  
  const formatDateRange = (
    from?: string,
    to?: string
  ): { start: string; end: string } => {
    let result: { start: string; end: string } = { start: "", end: "" };
  
    if (from) {
      const ts = dateToday(from.trim());
      result.start = `${ts.year}-${leadingNum(ts.month)}-${leadingNum(ts.date)}`;
    }
  
    if (to) {
      const te = dateToday(to.trim());
      result.end = `${te.year}-${leadingNum(te.month)}-${leadingNum(
        te.date + 1
      )}`; // add 1 to include the current date
    }
  
    return result;
  };
  
  export const search = async (q: ISearchQuery): Promise<IPagination> => {
    let query: any;
    let resultArray: any,
      results: Array<any>,
      fields: string = "";
    let sortList: Array<any> = [];
    let order: number = -1;
  
    // copy request query
    const reqQuery = { ...q.queryParam };
  
    // fields to exclude
    const removeFields = ["select", "sort", "page", "limit", "order"];
  
    // loop over removeFields and delete them from request query
    removeFields.forEach((p) => delete reqQuery[p]);
  
    // create query string
    let queryStr = JSON.stringify(reqQuery);
  
    // create operators
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );
  
    // capture date range
    const dateRange = formatDateRange(q.queryParam.from, q.queryParam.to);
  
    // First define fields to be forcefully selected
    if (q.fields && q.fields.length > 0) {
      fields = q.fields
        .map((item) => {
          if (strIncludesEs6(item, "+")) {
            return item;
          } else {
            return `+${item}`;
          }
        })
        .join(" ");
    }
  
    // find resource using the $and operator
    // check if there is a conditional reference
    if (
      (!q.ref || q.ref === undefined || q.ref === null) &&
      (!q.value || q.value === undefined || q.value === null)
    ) {
      if (dateRange.start && !dateRange.end) {
        q.data.push({ createdAt: { $gte: new Date(dateRange.start) } });
      } else if (dateRange.start && dateRange.end) {
        q.data.push({
          createdAt: {
            $gte: new Date(dateRange.start),
            $lte: new Date(dateRange.end),
          },
        });
      }
  
      if (q.operator === "in") {
        query = q.model.find(q.data);
        resultArray = q.model.find(q.data);
      } else if (q.operator === "or") {
        query = q.model.find({ $or: q.data });
        resultArray = q.model.find({ $or: q.data });
      } else if (q.operator === "and") {
        query = q.model.find({ $and: q.data });
        resultArray = q.model.find({ $and: q.data });
      } else if (q.operator === "andor") {
        query = q.model.find({
          $and: [{ $or: q.query }, { $or: q.data }],
        });
        resultArray = q.model.find({
          $and: [{ $or: q.query }, { $or: q.data }],
        });
      } else if (q.operator === "orand") {
        query = q.model.find({
          $or: [{ $and: q.query }, { $and: q.data }],
        });
        resultArray = q.model.find({
          $or: [{ $and: q.query }, { $and: q.data }],
        });
      } else if (!q.operator && q.data) {
        query = q.model.find(q.data);
        resultArray = q.model.find(q.data);
      } else if (
        !q.operator &&
        (!q.data || q.data.length === 0 || isEmptyObject(q.data))
      ) {
        if (dateRange.start && !dateRange.end) {
          query = q.model.find({
            createdAt: { $gte: new Date(dateRange.start) },
          });
          resultArray = q.model.find({
            createdAt: { $gte: new Date(dateRange.start) },
          });
        } else if (dateRange.start && dateRange.end) {
          query = q.model.find({
            createdAt: {
              $gte: new Date(dateRange.start),
              $lte: new Date(dateRange.end),
            },
          });
          resultArray = q.model.find({
            createdAt: {
              $gte: new Date(dateRange.start),
              $lte: new Date(dateRange.end),
            },
          });
        } else {
          query = q.model.find({});
          resultArray = q.model.find({});
        }
      } else {
        if (dateRange.start && !dateRange.end) {
          query = q.model.find({
            createdAt: { $gte: new Date(dateRange.start) },
          });
          resultArray = q.model.find({
            createdAt: { $gte: new Date(dateRange.start) },
          });
        } else if (dateRange.start && dateRange.end) {
          query = q.model.find({
            createdAt: {
              $gte: new Date(dateRange.start),
              $lte: new Date(dateRange.end),
            },
          });
          resultArray = q.model.find({
            createdAt: {
              $gte: new Date(dateRange.start),
              $lte: new Date(dateRange.end),
            },
          });
        } else {
          query = q.model.find({});
          resultArray = q.model.find({});
        }
      }
    } else {
      if (dateRange.start && !dateRange.end) {
        q.data.push({ createdAt: { $gte: new Date(dateRange.start) } });
      } else if (dateRange.start && dateRange.end) {
        q.data.push({
          createdAt: {
            $gte: new Date(dateRange.start),
            $lte: new Date(dateRange.end),
          },
        });
      }
  
      if (q.operator === "in") {
        query = q.model.find(q.data).where(defineRef(q.ref)).equals(q.value);
        resultArray = q.model
          .find(q.data)
          .where(defineRef(q.ref))
          .equals(q.value);
      } else if (q.operator === "or") {
        query = q.model
          .find({ $or: q.data })
          .where(defineRef(q.ref))
          .equals(q.value);
        resultArray = q.model
          .find({ $or: q.data })
          .where(defineRef(q.ref))
          .equals(q.value);
      } else if (q.operator === "and") {
        query = q.model
          .find({ $and: q.data })
          .where(defineRef(q.ref))
          .equals(q.value);
        resultArray = q.model
          .find({ $and: q.data })
          .where(defineRef(q.ref))
          .equals(q.value);
      } else if (q.operator === "andor") {
        query = q.model
          .find({
            $and: [{ $or: q.query }, q.data],
          })
          .where(defineRef(q.ref))
          .equals(q.value);
        resultArray = q.model
          .find({
            $and: [{ $or: q.query }, q.data],
          })
          .where(defineRef(q.ref))
          .equals(q.value);
      } else if (!q.operator && q.data) {
        query = q.model.find(q.data).where(defineRef(q.ref)).equals(q.value);
        resultArray = q.model
          .find(q.data)
          .where(defineRef(q.ref))
          .equals(q.value);
      } else if (
        !q.operator &&
        (!q.data || q.data.length === 0 || isEmptyObject(q.data))
      ) {
        if (dateRange.start && !dateRange.end) {
          query = q.model
            .find({ createdAt: { $gte: new Date(dateRange.start) } })
            .where(defineRef(q.ref))
            .equals(q.value);
          resultArray = q.model
            .find({ createdAt: { $gte: new Date(dateRange.start) } })
            .where(defineRef(q.ref))
            .equals(q.value);
        } else if (dateRange.start && dateRange.end) {
          query = q.model
            .find({
              createdAt: {
                $gte: new Date(dateRange.start),
                $lte: new Date(dateRange.end),
              },
            })
            .where(defineRef(q.ref))
            .equals(q.value);
          resultArray = q.model
            .find({
              createdAt: {
                $gte: new Date(dateRange.start),
                $lte: new Date(dateRange.end),
              },
            })
            .where(defineRef(q.ref))
            .equals(q.value);
        } else {
          query = q.model.find({}).where(defineRef(q.ref)).equals(q.value);
          resultArray = q.model.find({}).where(defineRef(q.ref)).equals(q.value);
        }
      } else {
        if (dateRange.start && !dateRange.end) {
          query = q.model
            .find({ createdAt: { $gte: new Date(dateRange.start) } })
            .where(defineRef(q.ref))
            .equals(q.value);
          resultArray = q.model
            .find({ createdAt: { $gte: new Date(dateRange.start) } })
            .where(defineRef(q.ref))
            .equals(q.value);
        } else if (dateRange.start && dateRange.end) {
          query = q.model
            .find({
              createdAt: {
                $gte: new Date(dateRange.start),
                $lte: new Date(dateRange.end),
              },
            })
            .where(defineRef(q.ref))
            .equals(q.value);
          resultArray = q.model
            .find({
              createdAt: {
                $gte: new Date(dateRange.start),
                $lte: new Date(dateRange.end),
              },
            })
            .where(defineRef(q.ref))
            .equals(q.value);
        } else {
          query = q.model.find({}).where(defineRef(q.ref)).equals(q.value);
          resultArray = q.model.find({}).where(defineRef(q.ref)).equals(q.value);
        }
      }
    }
  
    // select fields
    if (q.queryParam.select) {
      const selects = q.queryParam.select.toString().split(",").join(" ");
      fields = `${fields} ${selects}`;
      resultArray = resultArray.select(fields);
      query = query.select(fields);
    } else {
      resultArray = resultArray.select(fields);
      query = query.select(fields);
    }
  
    // sort
    if (q.queryParam.order && q.queryParam.order === "asc") {
      order = 1;
    } else if (q.queryParam.order && q.queryParam.order === "desc") {
      order = -1;
    }
  
    if (q.queryParam.sort) {
      let sobj: object = {};
      const spl: Array<string> = q.queryParam.sort.toString().split(",");
  
      if (spl.length > 0) {
        /*
                create a list of keys & values based on
                list of sort keys supplied
            */
        spl.forEach((x) => {
          sortList.push({ k: x, v: order });
        });
  
        // turn the list into a single object like { k:v, k:v, k:v }
        sobj = sortList.reduce(
          (o, itm) => Object.assign(o, { [itm.k]: itm.v }),
          {}
        );
  
        resultArray = resultArray.sort(sobj);
        query = query.sort(sobj); // define the sort query
      }
    } else {
      resultArray = resultArray.sort({ createdAt: order });
      query = query.sort({ createdAt: order });
    }
  
    // pagination
    const page = q.queryParam.page
      ? parseInt(q.queryParam.page.toString(), 10)
      : 1;
    const limit = q.queryParam.limit
      ? parseInt(q.queryParam.limit.toString(), 10)
      : 50;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
  
    query = query.skip(startIndex).limit(limit);
  
    //populate
    if (q.populate) {
      query = query.populate(q.populate);
    }
  
    // execute query
    results = await query;
  
    // get the total document records
    const totalRec = await q.model.countDocuments();
  
    // Pagination result
    const pagination: any = {};
  
    // return pagination based on total records or referenced records
    if (
      !q.queryParam.paginate ||
      (q.queryParam.paginate && q.queryParam.paginate === "absolute")
    ) {
      if (endIndex < totalRec) {
        pagination.next = {
          page: page + 1,
          limit,
        };
      }
  
      if (startIndex > 0) {
        pagination.prev = {
          page: page - 1,
          limit,
        };
      }
    } else if (q.queryParam.paginate && q.queryParam.paginate === "relative") {
      if (endIndex < results.length) {
        pagination.next = {
          page: page + 1,
          limit,
        };
      }
  
      if (startIndex > 0) {
        pagination.prev = {
          page: page - 1,
          limit,
        };
      }
    }
  
    const result: IPagination = {
      total: totalRec,
      count: results.length,
      pagination: pagination,
      data: results,
    };
  
    return result;
  };
  