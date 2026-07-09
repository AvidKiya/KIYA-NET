"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  userId: string;
}

interface ServiceReviewsProps {
  serviceId: number;
}

export function ServiceReviews({ serviceId }: ServiceReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?serviceId=${serviceId}`);
      const data = await res.json();
      setReviews(data.reviews || []);
      setAverage(data.average || 0);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Failed to load reviews");
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [serviceId]);

  const submitReview = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          serviceId,
          rating: newRating,
          comment: newComment,
        }),
      });

      if (res.ok) {
        setNewComment("");
        setNewRating(5);
        fetchReviews();
      }
    } catch (error) {
      alert("خطا در ثبت نظر");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-4">
        <div className="text-4xl font-bold text-[var(--ink)]">{average.toFixed(1)}</div>
        <div>
          <div className="flex text-amber-400">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={18} className={s <= Math.round(average) ? "fill-current" : ""} />
            ))}
          </div>
          <div className="text-xs text-[var(--ink-dim)] mt-1">{total} نظر</div>
        </div>
      </div>

      {/* Write Review */}
      <div className="glass rounded-2xl p-5">
        <p className="text-sm font-medium mb-3">نظر خود را ثبت کنید</p>
        <div className="flex gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((star) => (
            <button key={star} onClick={() => setNewRating(star)} className="text-2xl">
              <Star className={star <= newRating ? "fill-amber-400 text-amber-400" : "text-white/30"} />
            </button>
          ))}
        </div>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="تجربه‌تان از این خدمت..."
          className="w-full rounded-xl bg-white/5 p-3 text-sm"
          rows={3}
        />
        <button
          onClick={submitReview}
          disabled={submitting || !newComment.trim()}
          className="btn-brand mt-3 px-6 py-2 text-sm rounded-xl disabled:opacity-50"
        >
          {submitting ? "در حال ارسال..." : "ثبت نظر"}
        </button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 && (
          <p className="text-sm text-[var(--ink-dim)] text-center py-4">هنوز نظری ثبت نشده است.</p>
        )}
        {reviews.map((review) => (
          <div key={review.id} className="glass rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex text-amber-400">
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} size={14} className="fill-current" />
                ))}
              </div>
              <span className="text-xs text-[var(--ink-dim)]">
                {new Date(review.createdAt).toLocaleDateString("fa-IR")}
              </span>
            </div>
            <p className="mt-3 text-sm text-[var(--ink)]">{review.comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}