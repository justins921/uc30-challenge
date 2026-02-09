import { useState } from 'react';

function timeAgo(dateStr) {
  const now = new Date();
  const d = new Date(dateStr);
  const seconds = Math.floor((now - d) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

function dayTagLabel(tag) {
  if (tag === 'getting_started') return 'Getting Started';
  if (typeof tag === 'number') return `Day ${tag}`;
  return null;
}

function Avatar({ name, picture, size = 36 }) {
  if (picture) {
    return (
      <img
        src={picture}
        alt={name}
        style={{
          width: size, height: size, borderRadius: '50%',
          objectFit: 'cover', flexShrink: 0,
        }}
      />
    );
  }
  const initials = (name || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'rgba(233,69,96,0.12)', border: '1px solid rgba(233,69,96,0.2)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38, fontWeight: 700, color: '#e94560', flexShrink: 0,
      fontFamily: "'DM Sans', sans-serif",
    }}>
      {initials}
    </div>
  );
}

// ── New Post Form ─────────────────────────────────────────
function NewPostForm({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [dayTag, setDayTag] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSubmitting(true);
    const tag = dayTag === '' ? null : dayTag === 'getting_started' ? 'getting_started' : Number(dayTag);
    await onSubmit(title.trim(), body.trim(), tag);
    setSubmitting(false);
  };

  return (
    <div className="card fade-up" style={{ padding: 24 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>New Post</h3>

      <input
        type="text"
        placeholder="Title — what's on your mind?"
        value={title}
        onChange={e => setTitle(e.target.value)}
        maxLength={120}
        style={{ width: '100%', marginBottom: 12, fontSize: 15, padding: '10px 14px' }}
      />

      <textarea
        placeholder="Share details, ask a question, celebrate a win..."
        value={body}
        onChange={e => setBody(e.target.value)}
        rows={4}
        style={{
          width: '100%', marginBottom: 12, fontSize: 14, padding: '10px 14px',
          resize: 'vertical', minHeight: 80,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <select
          value={dayTag}
          onChange={e => setDayTag(e.target.value)}
          style={{ width: 'auto', padding: '8px 12px', fontSize: 13, minWidth: 160 }}
        >
          <option value="">No day tag (general)</option>
          <option value="getting_started">Getting Started</option>
          {Array.from({ length: 30 }, (_, i) => (
            <option key={i + 1} value={i + 1}>Day {i + 1}</option>
          ))}
        </select>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button
            className="btn-secondary"
            onClick={onCancel}
            style={{ padding: '8px 16px', fontSize: 13 }}
          >
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!title.trim() || submitting}
            style={{ padding: '8px 20px', fontSize: 13, opacity: !title.trim() ? 0.5 : 1 }}
          >
            {submitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Post Card (feed view) ────────────────────────────────
function PostCard({ post, onClick }) {
  const commentCount = (post.comments || []).filter(c => !c.isDeleted).length;

  return (
    <div
      className="card"
      onClick={onClick}
      style={{
        padding: '16px 20px', cursor: 'pointer',
        transition: 'border-color 0.15s',
        borderLeft: post.isPinned ? '3px solid #e94560' : undefined,
      }}
      onMouseOver={e => e.currentTarget.style.borderColor = 'rgba(233,69,96,0.3)'}
      onMouseOut={e => e.currentTarget.style.borderColor = ''}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <Avatar name={post.authorName} picture={post.authorAvatar} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            {post.isPinned && (
              <span style={{
                fontSize: 10, fontWeight: 700, color: '#e94560',
                background: 'rgba(233,69,96,0.1)', padding: '2px 6px', borderRadius: 4,
                textTransform: 'uppercase', letterSpacing: 0.5,
              }}>
                Pinned
              </span>
            )}
            <span style={{ fontWeight: 600, fontSize: 14 }}>{post.authorName}</span>
            <span style={{ fontSize: 11, color: '#555' }}>{timeAgo(post.createdAt)}</span>
            {post.dayTag != null && (
              <span style={{
                fontSize: 10, padding: '2px 8px', borderRadius: 4,
                background: 'rgba(72,199,142,0.1)', color: '#48c78e',
                fontWeight: 600,
              }}>
                {dayTagLabel(post.dayTag)}
              </span>
            )}
          </div>
          <h4 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{post.title}</h4>
          {post.body && (
            <p style={{
              color: '#999', fontSize: 13, lineHeight: 1.5,
              overflow: 'hidden', textOverflow: 'ellipsis',
              display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
            }}>
              {post.body}
            </p>
          )}
          <div style={{ display: 'flex', gap: 16, marginTop: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#666' }}>
              {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Post Detail View ─────────────────────────────────────
function PostDetail({ post, user, onBack, onComment, onDeletePost, onDeleteComment, onPin }) {
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isAdmin = user?.isAdmin;
  const isBanned = user?.communityBanned;

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    await onComment(post.id, commentText.trim());
    setCommentText('');
    setSubmitting(false);
  };

  const visibleComments = (post.comments || []).map(c =>
    c.isDeleted ? { ...c, text: '[Removed by moderator]', authorName: '' } : c
  );

  return (
    <div className="fade-up">
      <button
        className="btn-secondary"
        onClick={onBack}
        style={{ marginBottom: 16, padding: '8px 16px', fontSize: 13 }}
      >
        ← Back to Community
      </button>

      {/* Post */}
      <div className="card" style={{
        padding: 24, marginBottom: 16,
        borderLeft: post.isPinned ? '3px solid #e94560' : undefined,
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Avatar name={post.authorName} picture={post.authorAvatar} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
              {post.isPinned && (
                <span style={{
                  fontSize: 10, fontWeight: 700, color: '#e94560',
                  background: 'rgba(233,69,96,0.1)', padding: '2px 6px', borderRadius: 4,
                  textTransform: 'uppercase', letterSpacing: 0.5,
                }}>
                  Pinned
                </span>
              )}
              <span style={{ fontWeight: 600, fontSize: 15 }}>{post.authorName}</span>
              <span style={{ fontSize: 12, color: '#555' }}>{timeAgo(post.createdAt)}</span>
              {post.dayTag != null && (
                <span style={{
                  fontSize: 10, padding: '2px 8px', borderRadius: 4,
                  background: 'rgba(72,199,142,0.1)', color: '#48c78e',
                  fontWeight: 600,
                }}>
                  {dayTagLabel(post.dayTag)}
                </span>
              )}
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{post.title}</h3>
            {post.body && (
              <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                {post.body}
              </p>
            )}
          </div>
        </div>

        {/* Admin actions */}
        {isAdmin && (
          <div style={{
            display: 'flex', gap: 8, marginTop: 16, paddingTop: 12,
            borderTop: '1px solid rgba(255,255,255,0.06)', flexWrap: 'wrap',
          }}>
            <button
              onClick={() => onPin(post.id, !post.isPinned)}
              style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 5, cursor: 'pointer',
                border: '1px solid rgba(233,69,96,0.2)', background: 'rgba(233,69,96,0.06)',
                color: '#e94560', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              }}
            >
              {post.isPinned ? 'Unpin' : 'Pin Post'}
            </button>
            <button
              onClick={() => { if (confirm('Delete this post? It will show as [Removed by moderator].')) onDeletePost(post.id); }}
              style={{
                fontSize: 11, padding: '4px 10px', borderRadius: 5, cursor: 'pointer',
                border: '1px solid rgba(255,80,80,0.2)', background: 'rgba(255,80,80,0.06)',
                color: '#ff5050', fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
              }}
            >
              Delete Post
            </button>
          </div>
        )}
      </div>

      {/* Comments */}
      <div style={{ marginBottom: 16 }}>
        <h4 style={{ fontSize: 13, color: '#888', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          Comments ({visibleComments.length})
        </h4>

        {visibleComments.length === 0 ? (
          <div className="card" style={{ padding: 24, textAlign: 'center' }}>
            <p style={{ color: '#666', fontSize: 13 }}>No comments yet. Be the first!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {visibleComments.map(c => (
              <div key={c.id} className="card" style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  {!c.isDeleted && <Avatar name={c.authorName} picture={c.authorAvatar} size={28} />}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {!c.isDeleted && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                        <span style={{ fontWeight: 600, fontSize: 13 }}>{c.authorName}</span>
                        <span style={{ fontSize: 11, color: '#555' }}>{timeAgo(c.createdAt)}</span>
                      </div>
                    )}
                    <p style={{
                      color: c.isDeleted ? '#555' : '#ccc', fontSize: 13, lineHeight: 1.5,
                      fontStyle: c.isDeleted ? 'italic' : 'normal',
                    }}>
                      {c.text}
                    </p>
                    {isAdmin && !c.isDeleted && (
                      <button
                        onClick={() => onDeleteComment(post.id, c.id)}
                        style={{
                          fontSize: 10, padding: '2px 8px', borderRadius: 4, cursor: 'pointer',
                          border: '1px solid rgba(255,80,80,0.2)', background: 'transparent',
                          color: '#ff5050', fontWeight: 600, marginTop: 4,
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Comment input */}
      {!isBanned && (
        <div className="card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <textarea
              placeholder="Write a comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              rows={2}
              style={{
                flex: 1, fontSize: 13, padding: '8px 12px',
                resize: 'vertical', minHeight: 40,
              }}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleComment();
                }
              }}
            />
            <button
              className="btn-primary"
              onClick={handleComment}
              disabled={!commentText.trim() || submitting}
              style={{ padding: '8px 16px', fontSize: 13, flexShrink: 0, opacity: !commentText.trim() ? 0.5 : 1 }}
            >
              {submitting ? '...' : 'Reply'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Community Board ─────────────────────────────────
export default function CommunityBoard({
  user,
  posts,
  cohortStartDate,
  onCreatePost,
  onComment,
  onDeletePost,
  onDeleteComment,
  onPin,
  onDismissWarning,
}) {
  const [view, setView] = useState('feed'); // 'feed' | 'new' | 'detail'
  const [selectedPost, setSelectedPost] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all' | 'mine' | number | 'getting_started'
  const isBanned = user?.communityBanned;

  // Filter to current cohort, hide deleted (unless admin)
  const cohortPosts = (posts || []).filter(p => {
    if (p.cohortDate !== cohortStartDate && cohortStartDate) return false;
    if (p.isDeleted && !user?.isAdmin) return false;
    return true;
  });

  // Sort: pinned first, then newest
  const sorted = [...cohortPosts].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  // Apply filter
  const filtered = sorted.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'mine') return p.authorId === user?.id;
    return p.dayTag === filter;
  });

  // Undismissed warnings
  const warnings = (user?.communityWarnings || []).filter(w => !w.dismissed);

  const handleCreatePost = async (title, body, dayTag) => {
    const result = await onCreatePost(title, body, dayTag);
    if (result?.success) setView('feed');
  };

  const openPost = (post) => {
    setSelectedPost(post);
    setView('detail');
  };

  if (view === 'detail' && selectedPost) {
    // Refresh post data from array
    const freshPost = cohortPosts.find(p => p.id === selectedPost.id) || selectedPost;
    return (
      <PostDetail
        post={freshPost}
        user={user}
        onBack={() => { setView('feed'); setSelectedPost(null); }}
        onComment={onComment}
        onDeletePost={(id) => { onDeletePost(id); setView('feed'); setSelectedPost(null); }}
        onDeleteComment={onDeleteComment}
        onPin={onPin}
      />
    );
  }

  if (view === 'new') {
    return (
      <NewPostForm
        onSubmit={handleCreatePost}
        onCancel={() => setView('feed')}
      />
    );
  }

  return (
    <div className="fade-up">
      {/* Warnings banner */}
      {warnings.map((w, i) => {
        const actualIndex = (user?.communityWarnings || []).indexOf(w);
        return (
          <div key={i} className="card" style={{
            padding: '12px 16px', marginBottom: 12,
            background: 'rgba(240,165,0,0.08)', border: '1px solid rgba(240,165,0,0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>&#9888;</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f0a500', marginBottom: 2 }}>
                  Moderator Warning
                </div>
                <p style={{ fontSize: 13, color: '#ccc', lineHeight: 1.5 }}>{w.message}</p>
              </div>
              <button
                onClick={() => onDismissWarning(actualIndex)}
                style={{
                  fontSize: 11, padding: '4px 10px', borderRadius: 5, cursor: 'pointer',
                  border: '1px solid rgba(240,165,0,0.3)', background: 'transparent',
                  color: '#f0a500', fontWeight: 600, flexShrink: 0,
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                Dismiss
              </button>
            </div>
          </div>
        );
      })}

      {/* Banned banner */}
      {isBanned && (
        <div className="card" style={{
          padding: '16px 20px', marginBottom: 16, textAlign: 'center',
          background: 'rgba(255,80,80,0.06)', border: '1px solid rgba(255,80,80,0.2)',
        }}>
          <p style={{ color: '#ff5050', fontSize: 14, fontWeight: 600 }}>
            You have been banned from the community. You can still view posts but cannot post or comment.
          </p>
        </div>
      )}

      {/* Header + New Post button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700 }}>Community</h2>
        {!isBanned && (
          <button
            className="btn-primary"
            onClick={() => setView('new')}
            style={{ padding: '8px 20px', fontSize: 13 }}
          >
            + New Post
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {[
          { value: 'all', label: 'All Posts' },
          { value: 'mine', label: 'My Posts' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              fontSize: 12, padding: '6px 14px', borderRadius: 6, cursor: 'pointer',
              border: `1px solid ${filter === f.value ? 'rgba(233,69,96,0.4)' : 'rgba(255,255,255,0.08)'}`,
              background: filter === f.value ? 'rgba(233,69,96,0.1)' : 'transparent',
              color: filter === f.value ? '#e94560' : '#888',
              fontWeight: 600, fontFamily: "'DM Sans', sans-serif",
            }}
          >
            {f.label}
          </button>
        ))}
        <select
          value={typeof filter === 'number' || filter === 'getting_started' ? filter : ''}
          onChange={e => {
            const v = e.target.value;
            if (v === '') setFilter('all');
            else if (v === 'getting_started') setFilter('getting_started');
            else setFilter(Number(v));
          }}
          style={{ width: 'auto', padding: '6px 10px', fontSize: 12, minWidth: 130 }}
        >
          <option value="">Filter by day...</option>
          <option value="getting_started">Getting Started</option>
          {Array.from({ length: 30 }, (_, i) => (
            <option key={i + 1} value={i + 1}>Day {i + 1}</option>
          ))}
        </select>
      </div>

      {/* Posts feed */}
      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
          <p style={{ color: '#666', fontSize: 14 }}>
            {filter === 'mine'
              ? "You haven't posted yet. Share your progress!"
              : 'No posts yet. Be the first to start a conversation!'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(post => (
            <PostCard
              key={post.id}
              post={post.isDeleted ? { ...post, title: '[Removed by moderator]', body: '', authorName: post.authorName } : post}
              onClick={() => !post.isDeleted && openPost(post)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
